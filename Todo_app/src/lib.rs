use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]


pub struct Task {
    pub description: String,
    pub completed: bool,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct TodoList {
    pub tasks: Vec<Task>,
}

pub enum TodoInstruction {
    AddTask(String),
    CompleteTask(u32), 
}

// Program entrypoint
entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let user_account = next_account_info(accounts_iter)?;

    msg!("Todo program invoked by {:?}", user_account.key);
    msg!("Instruction data: {:?}", instruction_data);

    // TODO: Add task logic later
    Ok(())
}