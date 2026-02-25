# Intermediate

This folder contains 4 advanced Solana programs covering DeFi protocols, NFT staking, and decentralized markets built with the Anchor framework.

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

### 1. AMM

Automated Market Maker using the constant product formula for on-chain token swaps.

```bash
cd AMM
yarn install
anchor build
anchor test
```

---

### 2. Nft_Stacking

NFT staking protocol with on-chain reward emission logic.

```bash
cd Nft_Stacking
yarn install
anchor build
anchor test
```

---

### 3. nft-mplxcore

NFT creation and management using the Metaplex Core standard. This project requires **Surfpool** as the local validator instead of the default Solana test validator.

**Terminal 1 — Start Surfpool:**

```bash
surfpool start --watch
```

**Terminal 2 — Run tests:**

```bash
cd nft-mplxcore
yarn install
anchor build
anchor test --skip-local-validator --skip-deploy
```

> Note: Make sure Surfpool is fully running before executing the tests in Terminal 2.

---

### 4. solana_predication_market

Decentralized prediction market with on-chain settlement and resolution logic.

```bash
cd solana_predication_market
yarn install
anchor build
anchor test
```

---

## Notes

- AMM, Nft_Stacking, and solana_predication_market run on a local Solana validator by default.
- Make sure your Solana CLI is set to localnet before running those tests:

```bash
solana config set --url localhost
```

- To start a local validator manually:

```bash
solana-test-validator
```
