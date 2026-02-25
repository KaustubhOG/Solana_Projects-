import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { AnchorDiceGameQ425 } from "../target/types/anchor_dice_game_q4_25";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("anchor-dice-game-q4-25", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.AnchorDiceGameQ425 as Program<AnchorDiceGameQ425>;
  const connection = provider.connection;

  const house = Keypair.generate();
  const player = Keypair.generate();

  let vault: PublicKey;
  let bet: PublicKey;

  const seed = new BN(42);
  const roll = 50;
  const betAmount = new BN(0.1 * LAMPORTS_PER_SOL);
  const initAmount = new BN(2 * LAMPORTS_PER_SOL);

  before(async () => {
    [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), house.publicKey.toBuffer()],
      program.programId
    );

    const seedBuffer = seed.toArrayLike(Buffer, "le", 16);

    [bet] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), vault.toBuffer(), seedBuffer],
      program.programId
    );

    await connection.confirmTransaction(
      await connection.requestAirdrop(house.publicKey, 10 * LAMPORTS_PER_SOL)
    );

    await connection.confirmTransaction(
      await connection.requestAirdrop(player.publicKey, 10 * LAMPORTS_PER_SOL)
    );
  });

  it("initializes the vault", async () => {
    await program.methods
      .initialize(initAmount)
      .accounts({
        house: house.publicKey,
        vault,
      })
      .signers([house])
      .rpc();

    const balance = await connection.getBalance(vault);
    assert.ok(balance >= initAmount.toNumber());
  });

  it("places a bet", async () => {
    await program.methods
      .placeBet(seed, roll, betAmount)
      .accounts({
        player: player.publicKey,
        house: house.publicKey,
        vault,
        bet,
      })
      .signers([player])
      .rpc();

    const betAccount = await program.account.bet.fetch(bet);
    assert.equal(betAccount.player.toBase58(), player.publicKey.toBase58());
    assert.equal(betAccount.roll, roll);
    assert.ok(betAccount.amount.eq(betAmount));
  });

  it("rejects a bet below minimum", async () => {
    const smallSeed = new BN(99);
    const smallSeedBuffer = smallSeed.toArrayLike(Buffer, "le", 16);

    const [smallBet] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), vault.toBuffer(), smallSeedBuffer],
      program.programId
    );

    try {
      await program.methods
        .placeBet(smallSeed, roll, new BN(1000))
        .accounts({
          player: player.publicKey,
          house: house.publicKey,
          vault,
          bet: smallBet,
        })
        .signers([player])
        .rpc();
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.include(e.message, "MinimumBet");
    }
  });

  it("rejects a roll below minimum", async () => {
    const badSeed = new BN(77);
    const badSeedBuffer = badSeed.toArrayLike(Buffer, "le", 16);

    const [badBet] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), vault.toBuffer(), badSeedBuffer],
      program.programId
    );

    try {
      await program.methods
        .placeBet(badSeed, 1, betAmount)
        .accounts({
          player: player.publicKey,
          house: house.publicKey,
          vault,
          bet: badBet,
        })
        .signers([player])
        .rpc();
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.include(e.message, "MinimumRoll");
    }
  });

  it("rejects a roll above maximum", async () => {
    const badSeed = new BN(88);
    const badSeedBuffer = badSeed.toArrayLike(Buffer, "le", 16);

    const [badBet] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), vault.toBuffer(), badSeedBuffer],
      program.programId
    );

    try {
      await program.methods
        .placeBet(badSeed, 97, betAmount)
        .accounts({
          player: player.publicKey,
          house: house.publicKey,
          vault,
          bet: badBet,
        })
        .signers([player])
        .rpc();
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.include(e.message, "MaximumRoll");
    }
  });

  it("refund fails before timeout", async () => {
    try {
      await program.methods
        .refundBet()
        .accounts({
          player: player.publicKey,
          house: house.publicKey,
          vault,
          bet,
        })
        .signers([player])
        .rpc();
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.include(e.message, "TimeoutNotReached");
    }
  });
});