# Easy-Medium

This folder contains 4 Solana programs that build on beginner concepts. Projects here introduce real-world mechanics like escrows, vaults, randomness, and weighted voting using the Anchor framework.

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

### 1. dice_game

On-chain dice game with wager mechanics and verifiable randomness.

```bash
cd dice_game
yarn install
anchor build
anchor test
```

---

### 2. escrow

Token escrow program where two parties can make, take, and cancel offers.

```bash
cd escrow
yarn install
anchor build
anchor test
```

---

### 3. quadratic-voting

Voting program where votes are weighted quadratically to prevent whale dominance.

```bash
cd quadratic-voting
yarn install
anchor build
anchor test
```

---

### 4. vault

Secure SOL vault with deposit and withdrawal logic using PDAs.

```bash
cd vault
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
