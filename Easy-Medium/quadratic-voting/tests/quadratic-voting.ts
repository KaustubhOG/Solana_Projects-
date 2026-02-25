import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorError, BN } from "@coral-xyz/anchor";
import { QuadraticVoting } from "../target/types/quadratic_voting";
import {
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from "@solana/web3.js";
import {
  createMint,
  createAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("quadratic-voting", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.QuadraticVoting as Program<QuadraticVoting>;
  const connection = provider.connection;

  const creator = Keypair.generate();
  const voter = Keypair.generate();

  const daoName = "test-dao";
  const proposalMetadata = "Should we upgrade the protocol?";

  let daoAccount: PublicKey;
  let proposal: PublicKey;
  let voteAccount: PublicKey;
  let mint: PublicKey;
  let voterTokenAccount: PublicKey;

  before(async () => {
    await connection.confirmTransaction(
      await connection.requestAirdrop(creator.publicKey, 10 * LAMPORTS_PER_SOL)
    );
    await connection.confirmTransaction(
      await connection.requestAirdrop(voter.publicKey, 10 * LAMPORTS_PER_SOL)
    );

    [daoAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), creator.publicKey.toBuffer(), Buffer.from(daoName)],
      program.programId
    );

    mint = await createMint(
      connection,
      creator,
      creator.publicKey,
      null,
      0
    );

    voterTokenAccount = await createAccount(
      connection,
      voter,
      mint,
      voter.publicKey
    );

    await mintTo(
      connection,
      creator,
      mint,
      voterTokenAccount,
      creator,
      100
    );
  });

  it("initializes a dao", async () => {
    await program.methods
      .initializeDao(daoName)
      .accounts({
        creator: creator.publicKey,
        daoAccount,
      })
      .signers([creator])
      .rpc();

    const dao = await program.account.dao.fetch(daoAccount);
    assert.equal(dao.name, daoName);
    assert.equal(dao.authority.toBase58(), creator.publicKey.toBase58());
    assert.equal(dao.proposalCount.toNumber(), 0);
  });

  it("initializes a proposal", async () => {
    const daoData = await program.account.dao.fetch(daoAccount);

    [proposal] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("proposal"),
        daoAccount.toBuffer(),
        daoData.proposalCount.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .initializeProposal(proposalMetadata)
      .accounts({
        creator: creator.publicKey,
        daoAccount,
        proposal,
      })
      .signers([creator])
      .rpc();

    const proposalData = await program.account.proposal.fetch(proposal);
    assert.equal(proposalData.metadata, proposalMetadata);
    assert.equal(proposalData.authority.toBase58(), creator.publicKey.toBase58());
    assert.equal(proposalData.yesVoteCount.toNumber(), 0);
    assert.equal(proposalData.noVoteCount.toNumber(), 0);

    const updatedDao = await program.account.dao.fetch(daoAccount);
    assert.equal(updatedDao.proposalCount.toNumber(), 1);
  });

  it("casts a yes vote", async () => {
    [voteAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), voter.publicKey.toBuffer(), proposal.toBuffer()],
      program.programId
    );

    await program.methods
      .castVote(0)
      .accounts({
        voter: voter.publicKey,
        daoAccount,
        proposal,
        voteAccount,
        creatorTokenAccount: voterTokenAccount,
      })
      .signers([voter])
      .rpc();

    const voteData = await program.account.vote.fetch(voteAccount);
    assert.equal(voteData.authority.toBase58(), voter.publicKey.toBase58());
    assert.equal(voteData.voteType, 0);
    assert.equal(voteData.voteCredits.toNumber(), 10);

    const proposalData = await program.account.proposal.fetch(proposal);
    assert.equal(proposalData.yesVoteCount.toNumber(), 10);
    assert.equal(proposalData.noVoteCount.toNumber(), 0);
  });

  it("rejects invalid vote type", async () => {
    const voter2 = Keypair.generate();
    await connection.confirmTransaction(
      await connection.requestAirdrop(voter2.publicKey, 10 * LAMPORTS_PER_SOL)
    );

    const voter2TokenAccount = await createAccount(
      connection,
      voter2,
      mint,
      voter2.publicKey
    );

    await mintTo(connection, creator, mint, voter2TokenAccount, creator, 100);

    const [vote2Account] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), voter2.publicKey.toBuffer(), proposal.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .castVote(2)
        .accounts({
          voter: voter2.publicKey,
          daoAccount,
          proposal,
          voteAccount: vote2Account,
          creatorTokenAccount: voter2TokenAccount,
        })
        .signers([voter2])
        .rpc();
      assert.fail("should have thrown");
    } catch (e) {
      if (e instanceof AnchorError) {
        assert.equal(e.error.errorCode.code, "InvalidVoteType");
      } else {
        throw e;
      }
    }
  });
});