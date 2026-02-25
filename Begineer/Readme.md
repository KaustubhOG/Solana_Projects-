# Beginner

This folder contains 4 beginner-level Solana programs built with the Anchor framework. Each project is self-contained and can be run independently.

---

## Prerequisites

Make sure you have the following installed before running any project:

- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- [Node.js](https://nodejs.org/) (v18 or above)
- [Yarn](https://yarnpkg.com/)

---

## Projects

### 1. crud-app

Basic on-chain CRUD operations using Program Derived Addresses.

```bash
cd crud-app
yarn install
anchor build
anchor test
```

---

### 2. favorites

Store and retrieve user-specific data on-chain.

```bash
cd favorites
yarn install
anchor build
anchor test
```

---

### 3. Token

Create and manage SPL tokens — mint, transfer, and burn.

```bash
cd Token
yarn install
anchor build
anchor test
```

---

### 4. voting_program

Simple on-chain voting system with candidate registration and vote counting.

```bash
cd voting_program
yarn install
anchor build
anchor test
```

---

## Notes

- All projects run on a local Solana validator by default.
- Make sure your Solana CLI is set to localnet before running tests:

```bash
solana config set --url localhost
```

- To start a local validator manually:

```bash
solana-test-validator
```
