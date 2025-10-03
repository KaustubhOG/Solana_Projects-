use anchor_lang::prelude::*;

declare_id!("");

#[program]
pub mod voting {
    use super::*;

    pub fn initialize_poll(ctx: Context<InitializePoll>, 
                            _poll_id: u64, 
                            start_time: u64, 
                            end_time: u64,
                            name: String,
                            description: String) -> Result<()> {
        ctx.accounts.poll_account.poll_name = name;
        ctx.accounts.poll_account.poll_description = description;
        ctx.accounts.poll_account.poll_voting_start = start_time;
        ctx.accounts.poll_account.poll_voting_end = end_time;
        Ok(())
    }
     pub fn initialize_candidate(ctx: Context<InitializeCandidate>, 
                                _poll_id: u64, 
                                candidate: String) -> Result<()> {
        ctx.accounts.candidate_account.candidate_name = candidate;
        ctx.accounts.poll_account.poll_option_index += 1;
        Ok(())
    }
       pub fn vote(ctx: Context<Vote>, _poll_id: u64, _candidate: String) -> Result<()> {
        let candidate_account = &mut ctx.accounts.candidate_account;
        let current_time = Clock::get()?.unix_timestamp;

        if current_time > (ctx.accounts.poll_account.poll_voting_end as i64) {
            return Err(ErrorCode::VotingEnded.into());
        }

        if current_time <= (ctx.accounts.poll_account.poll_voting_start as i64) {
            return Err(ErrorCode::VotingNotStarted.into());
        }

        candidate_account.candidate_votes += 1;

        Ok(())
    }
    
}
#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + PollAccount::INIT_SPACE,
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll_account: Account<'info, PollAccount>,

    pub system_program: Program<'info, System>,
}
