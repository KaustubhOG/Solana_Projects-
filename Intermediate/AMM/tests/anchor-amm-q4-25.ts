import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorAmmQ425 } from "../target/types/anchor_amm_q4_25";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  mintTo,
  getOrCreateAssociatedTokenAccount,
  getAccount
} from "@solana/spl-token";
import { assert } from "chai";

describe("anchor-amm-q4-25", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorAmmQ425 as Program<AnchorAmmQ425>;
  
  const payer = provider.wallet as anchor.Wallet;
  const user = Keypair.generate();
  
  let mintX: PublicKey;
  let mintY: PublicKey;
  let mintLp: PublicKey;
  let config: PublicKey;
  let vaultX: PublicKey;
  let vaultY: PublicKey;
  let userXAta: PublicKey;
  let userYAta: PublicKey;
  let userLpAta: PublicKey;
  
  const seed = new anchor.BN(12345);
  const fee = 100;

  before(async () => {
    const airdropSig = await provider.connection.requestAirdrop(
      user.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    mintX = await createMint(
      provider.connection,
      payer.payer,
      payer.publicKey,
      null,
      6
    );

    mintY = await createMint(
      provider.connection,
      payer.payer,
      payer.publicKey,
      null,
      6
    );

    const userXAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer.payer,
      mintX,
      user.publicKey
    );
    userXAta = userXAccount.address;

    const userYAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer.payer,
      mintY,
      user.publicKey
    );
    userYAta = userYAccount.address;

    await mintTo(
      provider.connection,
      payer.payer,
      mintX,
      userXAta,
      payer.publicKey,
      10_000_000_000
    );

    await mintTo(
      provider.connection,
      payer.payer,
      mintY,
      userYAta,
      payer.publicKey,
      10_000_000_000
    );
  });

  it("Initialize pool", async () => {
    [config] = PublicKey.findProgramAddressSync(
      [Buffer.from("config"), seed.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    [mintLp] = PublicKey.findProgramAddressSync(
      [Buffer.from("lp"), config.toBuffer()],
      program.programId
    );

    vaultX = anchor.utils.token.associatedAddress({
      mint: mintX,
      owner: config,
    });

    vaultY = anchor.utils.token.associatedAddress({
      mint: mintY,
      owner: config,
    });

    await program.methods
      .initialize(seed, fee, null)
      .accounts({
        initializer: user.publicKey,
        mintX,
        mintY,
        mintLp,
        vaultX,
        vaultY,
        config,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const configAccount = await program.account.config.fetch(config);
    assert.equal(configAccount.fee, fee);
  });

  it("Deposit liquidity", async () => {
    userLpAta = anchor.utils.token.associatedAddress({
      mint: mintLp,
      owner: user.publicKey,
    });

    await program.methods
      .deposit(new anchor.BN(1_000_000), new anchor.BN(1_000_000), new anchor.BN(1_000_000))
      .accounts({
        user: user.publicKey,
        mintX,
        mintY,
        config,
        mintLp,
        vaultX,
        vaultY,
        userX: userXAta,
        userY: userYAta,
        userLp: userLpAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const userLpAccount = await getAccount(provider.connection, userLpAta);
    assert.ok(userLpAccount.amount > 0);
  });

  it("Swap X for Y", async () => {
    const userYBefore = await getAccount(provider.connection, userYAta);

    await program.methods
      .swap(true, new anchor.BN(100_000), new anchor.BN(1))
      .accounts({
        user: user.publicKey,
        mintX,
        mintY,
        config,
        vaultX,
        vaultY,
        userX: userXAta,
        userY: userYAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const userYAfter = await getAccount(provider.connection, userYAta);
    assert.ok(userYAfter.amount > userYBefore.amount);
  });

  it("Withdraw liquidity", async () => {
    const userXBefore = await getAccount(provider.connection, userXAta);
    const userYBefore = await getAccount(provider.connection, userYAta);

    await program.methods
      .withdraw(new anchor.BN(500_000), new anchor.BN(1), new anchor.BN(1))
      .accounts({
        user: user.publicKey,
        mintX,
        mintY,
        config,
        mintLp,
        vaultX,
        vaultY,
        userX: userXAta,
        userY: userYAta,
        userLp: userLpAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const userXAfter = await getAccount(provider.connection, userXAta);
    const userYAfter = await getAccount(provider.connection, userYAta);
    assert.ok(userXAfter.amount > userXBefore.amount);
    assert.ok(userYAfter.amount > userYBefore.amount);
  });
});