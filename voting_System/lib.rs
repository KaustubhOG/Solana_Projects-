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