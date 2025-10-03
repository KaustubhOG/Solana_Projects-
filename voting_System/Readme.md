# Voting System Solana Project

This project demonstrates a **Solana program using the Anchor framework** that allows users to create proposals and vote on them.

---

## Project Structure

- **programs/** – Contains the `voting_system` Solana program written in Rust with Anchor.  
- **tests/** – Contains tests written in TypeScript to interact with the program.  
- **Anchor.toml** – Anchor configuration file.  
- **Cargo.toml** – Rust dependencies for the program.

---



## How to Run

1. Clone the repo:
   ```bash
   git clone https://github.com/KaustubhOG/Solana_Projects.git
   cd Solana_Projects/voting_system
   ```

2. Install dependencies (for tests):
   ```bash
   npm install
   ```

3. Build the program:
   ```bash
   anchor build
   ```

4. Deploy to localnet:
   ```bash
   anchor deploy
   ```

5. Run tests:
   ```bash
   anchor test
   ```

---

## Notes

- Make sure to update the `declare_id!()` in `programs/voting_system/src/lib.rs` with the correct **Program ID** after deployment.  
- Each proposal is stored in its own PDA.  
- This project uses **Anchor macros** like `#[program]`, `#[account]`, and `#[derive(Accounts)]`.

---

## Author

**Kaustubh Shivarkar**
