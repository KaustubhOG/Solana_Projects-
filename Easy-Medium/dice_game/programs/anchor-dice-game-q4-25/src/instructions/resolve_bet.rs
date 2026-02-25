use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};
use anchor_lang::solana_program::sysvar::instructions::{
    load_current_index_checked, load_instruction_at_checked,
};
use solana_program::ed25519_program;

use crate::{errors::DiceError, state::Bet};

const ED25519_HEADER_SIZE: usize = 2;

#[derive(Accounts)]
pub struct ResolveBet<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    /// CHECK: house is only used as a seed reference; no data is read
    pub house: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"vault", house.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    #[account(
        mut,
        close = player,
        seeds = [b"bet", vault.key().as_ref(), bet.seed.to_le_bytes().as_ref()],
        bump = bet.bump
    )]
    pub bet: Account<'info, Bet>,
    /// CHECK: instructions sysvar validated via address constraint
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instruction_sysvar: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> ResolveBet<'info> {
    pub fn verify_ed25519_signature(&self, sig: &[u8]) -> Result<()> {
        let ix_sysvar = &self.instruction_sysvar;

        let current_index = load_current_index_checked(ix_sysvar)? as usize;
        require!(current_index > 0, DiceError::Ed25519Header);

        let ed25519_ix = load_instruction_at_checked(current_index - 1, ix_sysvar)?;

        require!(
            ed25519_ix.program_id == ed25519_program::ID,
            DiceError::Ed25519Program
        );
        require!(
            ed25519_ix.accounts.is_empty(),
            DiceError::Ed25519Accounts
        );

        let data = &ed25519_ix.data;

        // Minimum: 2-byte header + one 114-byte entry
        require!(data.len() >= ED25519_HEADER_SIZE + 114, DiceError::Ed25519DataLength);

        let num_sigs = data[0] as usize;
        require!(num_sigs >= 1, DiceError::Ed25519Header);

        // Each signature entry layout (all offsets are u16 LE at fixed positions):
        
        let entry = &data[ED25519_HEADER_SIZE..];

        let sig_offset     = u16::from_le_bytes([entry[0],  entry[1]])  as usize;
        let pubkey_offset  = u16::from_le_bytes([entry[4],  entry[5]])  as usize;
        let msg_offset     = u16::from_le_bytes([entry[8],  entry[9]])  as usize;
        let msg_size       = u16::from_le_bytes([entry[10], entry[11]]) as usize;

        require!(
            data.len() >= pubkey_offset + 32,
            DiceError::Ed25519Pubkey
        );
        require!(
            data.len() >= sig_offset + 64,
            DiceError::Ed25519Signature
        );
        require!(
            data.len() >= msg_offset + msg_size,
            DiceError::Ed25519Message
        );

        let ix_pubkey = &data[pubkey_offset..pubkey_offset + 32];
        require!(
            ix_pubkey == self.house.key().as_ref(),
            DiceError::Ed25519Pubkey
        );

        let ix_message = &data[msg_offset..msg_offset + msg_size];
        let expected_message = self.bet.to_slice();
        require!(
            ix_message == expected_message.as_slice(),
            DiceError::Ed25519Message
        );

        let ix_sig = &data[sig_offset..sig_offset + 64];
        require!(ix_sig == sig, DiceError::Ed25519Signature);

        Ok(())
    }

    pub fn resolve_bet(&mut self, sig: &[u8], bumps: &ResolveBetBumps) -> Result<()> {
        // The random result is derived from the first byte of the Ed25519 signature.
        // The signature is unpredictable to the player at bet-placement time because
        // it is produced by the house keypair over a message that includes the slot.
        let roll = sig[0] % 100 + 1;

        if roll <= self.bet.roll {
            // Player wins: payout = amount * (100 / roll), paid from vault
            let payout = self.bet
                .amount
                .checked_mul(100)
                .ok_or(DiceError::Overflow)?
                .checked_div(self.bet.roll as u64)
                .ok_or(DiceError::Overflow)?;

            let accounts = Transfer {
                from: self.vault.to_account_info(),
                to: self.player.to_account_info(),
            };

            let signer_seeds: &[&[&[u8]]] = &[&[
                b"vault",
                self.house.key.as_ref(),
                &[bumps.vault],
            ]];

            let ctx = CpiContext::new_with_signer(
                self.system_program.to_account_info(),
                accounts,
                signer_seeds,
            );

            transfer(ctx, payout)?;
        }
        // If player loses the bet account is closed (close = player constraint)
        // which refunds rent to the player; the wager stays in the vault.

        Ok(())
    }
}