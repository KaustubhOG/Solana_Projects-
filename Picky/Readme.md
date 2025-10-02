# Picky Solana Project

This project demonstrates a **Solana program using the Anchor framework** that allows users to store their favorite number, color, and hobbies on-chain.

---

## Project Structure

- **programs/** – Contains the `picky` Solana program written in Rust with Anchor.  
- **tests/** – Contains tests written in TypeScript to interact with the program.  
- **Anchor.toml** – Anchor configuration file.  
- **Cargo.toml** – Rust dependencies for the program.

---

## Features

- Stores a user's:
  - Favorite number (`u64`)  
  - Favorite color (`String`)  
  - Hobbies (`Vec<String>`)  
- Uses **PDA (Program Derived Address)** to uniquely store data for each user.  
- Includes a **test script** to verify that data is stored correctly.

---

## How to Run

1. Clone the repo:
   ```bash
   git clone https://github.com/KaustubhOG/Solana_Projects.git
   cd Solana_Projects/picky_project
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


