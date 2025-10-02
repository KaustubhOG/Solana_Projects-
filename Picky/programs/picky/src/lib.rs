use anchor_lang::prelude::*;

declare_id!("H84mcqeMMNS6Z1pHDZBwZSzE94TSKxhVkbV24Umhqnw1");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod picky {
    use super::*;

    pub fn set_picky(
        ctx: Context<SetPicky>,
        number: u64,
        color: String,
        hobbies: Vec<String>,
    ) -> Result<()> {
        let user_pubkey = ctx.accounts.user.key();
        msg!("Greetings from {}", ctx.program_id);
        msg!(
            "User {}'s favorite number is {}, favorite color is: {}",
            user_pubkey,
            number,
            color
        );
        msg!("User's hobbies are: {:?}", hobbies);

        ctx.accounts.picky.set_inner(Picky {
            number,
            color,
            hobbies,
        });

        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct Picky {
    pub number: u64,
    #[max_len(50)]
    pub color: String,
    #[max_len(5, 50)]
    pub hobbies: Vec<String>,
}

#[derive(Accounts)]
pub struct SetPicky<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Picky::INIT_SPACE,
        seeds = [b"picky", user.key().as_ref()],
        bump
    )]
    pub picky: Account<'info, Picky>,

    pub system_program: Program<'info, System>,
}
