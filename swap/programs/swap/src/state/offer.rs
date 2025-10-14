use anchor_lang::prelude::*;
#[account]
#[derive(InitSpace)]
pub struct Offer {
    pub id: u64,
    pub maker: Pubkey,
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub token_B_wanted_amount: u64,
    pub bump: u8,
}
