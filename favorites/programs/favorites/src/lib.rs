use anchor_lang::prelude::*;

declare_id!("GE3yf9XVmbpb4xJq73kJrg2tnVEFe5kSWKs5pCq6cCRA");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod favorites {
    use super::*;

    pub fn add_favorites(
        ctx: Context<AddFavorites>,
        number: u64,
        color: String,
        hobbies: String,
    ) -> Result<()> {
        let acc = &mut ctx.accounts.favorites;
        acc.number = number;
        acc.color = color;
        acc.hobbies = hobbies;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct AddFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Favorites::INIT_SPACE,
        seeds=[b"favorites", user.key().as_ref()],
        bump
    )]
    pub favorites: Account<'info, Favorites>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Favorites {
    pub number: u64,
    #[max_len(50)]
    pub color: String,
    #[max_len(50)]
    pub hobbies: String,
}
