
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



