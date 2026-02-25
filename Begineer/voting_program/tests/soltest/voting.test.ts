import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";

describe("voting", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Voting as Program<Voting>;

  it("successfully creates a poll", async () => {
    const poll_id = new anchor.BN(1);
    const start_time = new anchor.BN(1);
    const end_time = new anchor.BN(1);
    const name = "Test_1";
    const description = "Test description_1";

    const [poll_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from([112, 111, 108, 108]),
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8))
      ],
      program.programId
    );

    await program.methods
      .initializePoll(poll_id, start_time, end_time, name, description)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: poll_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("fails to create a poll with unauthorized signer", async () => {
    const poll_id = new anchor.BN(2);
    const start_time = new anchor.BN(2);
    const end_time = new anchor.BN(2);
    const name = "Test_2";
    const description = "Test description_2";

    const [poll_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from([112, 111, 108, 108]),
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8))
      ],
      program.programId
    );

    try {
      await program.methods
        .initializePoll(poll_id, start_time, end_time, name, description)
        .accounts({
        signer: anchor.web3.Keypair.generate().publicKey,
        pollAccount: poll_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc();
      throw new Error("Expected to fail");
    } catch (err: any) {
      if (err.message === "Expected to fail") throw err;
    }
  });

  it("handles create a poll with minimal values", async () => {
    const poll_id = new anchor.BN(0);
    const start_time = new anchor.BN(0);
    const end_time = new anchor.BN(0);
    const name = "";
    const description = "";

    const [poll_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from([112, 111, 108, 108]),
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8))
      ],
      program.programId
    );

    await program.methods
      .initializePoll(poll_id, start_time, end_time, name, description)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: poll_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("successfully creates a candidate", async () => {
    const poll_id = new anchor.BN(4);
    const candidate = "Alice_4";

    const [candidate_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8)),
      Buffer.from(candidate)
      ],
      program.programId
    );

    await program.methods
      .initializeCandidate(poll_id, candidate)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: provider.wallet.publicKey,
        candidateAccount: candidate_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("fails to create a candidate with unauthorized signer", async () => {
    const poll_id = new anchor.BN(5);
    const candidate = "Alice_5";

    const [candidate_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8)),
      Buffer.from(candidate)
      ],
      program.programId
    );

    try {
      await program.methods
        .initializeCandidate(poll_id, candidate)
        .accounts({
        signer: anchor.web3.Keypair.generate().publicKey,
        pollAccount: provider.wallet.publicKey,
        candidateAccount: candidate_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc();
      throw new Error("Expected to fail");
    } catch (err: any) {
      if (err.message === "Expected to fail") throw err;
    }
  });

  it("handles create a candidate with minimal values", async () => {
    const poll_id = new anchor.BN(0);
    const candidate = "";

    const [candidate_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8)),
      Buffer.from(candidate)
      ],
      program.programId
    );

    await program.methods
      .initializeCandidate(poll_id, candidate)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: provider.wallet.publicKey,
        candidateAccount: candidate_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("successfully cast vote fors data", async () => {
    // Setup: Create required accounts
    const poll_id = new anchor.BN(7);
    const start_time = new anchor.BN(7);
    const end_time = new anchor.BN(7);
    const name = "Test_1_7";
    const description = "Test description_1_7";
    const [poll_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from([112, 111, 108, 108]),
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8))
      ],
      program.programId
    );
    await program.methods
      .initializePoll(poll_id, start_time, end_time, name, description)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: poll_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
    const candidate = "Alice_1_7";
    const [candidate_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8)),
      Buffer.from(candidate)
      ],
      program.programId
    );
    await program.methods
      .initializeCandidate(poll_id, candidate)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: provider.wallet.publicKey,
        candidateAccount: candidate_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    await program.methods
      .vote(poll_id, candidate)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: poll_accountPda,
        candidateAccount: candidate_accountPda
      })
      .rpc();
  });

  it("fails to cast vote for data with unauthorized signer", async () => {
    // Setup: Create required accounts
    const poll_id = new anchor.BN(8);
    const start_time = new anchor.BN(8);
    const end_time = new anchor.BN(8);
    const name = "Test_1_8";
    const description = "Test description_1_8";
    const [poll_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from([112, 111, 108, 108]),
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8))
      ],
      program.programId
    );
    await program.methods
      .initializePoll(poll_id, start_time, end_time, name, description)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: poll_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
    const candidate = "Alice_1_8";
    const [candidate_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8)),
      Buffer.from(candidate)
      ],
      program.programId
    );
    await program.methods
      .initializeCandidate(poll_id, candidate)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: provider.wallet.publicKey,
        candidateAccount: candidate_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    try {
      await program.methods
        .vote(poll_id, candidate)
        .accounts({
        signer: anchor.web3.Keypair.generate().publicKey,
        pollAccount: poll_accountPda,
        candidateAccount: candidate_accountPda
        })
        .rpc();
      throw new Error("Expected to fail");
    } catch (err: any) {
      if (err.message === "Expected to fail") throw err;
    }
  });

  it("handles cast vote for data with minimal values", async () => {
    // Setup: Create required accounts
    const poll_id = new anchor.BN(9);
    const start_time = new anchor.BN(9);
    const end_time = new anchor.BN(9);
    const name = "Test_1_9";
    const description = "Test description_1_9";
    const [poll_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from([112, 111, 108, 108]),
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8))
      ],
      program.programId
    );
    await program.methods
      .initializePoll(poll_id, start_time, end_time, name, description)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: poll_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
    const candidate = "Alice_1_9";
    const [candidate_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(poll_id.toArrayLike(Buffer, "le", 8)),
      Buffer.from(candidate)
      ],
      program.programId
    );
    await program.methods
      .initializeCandidate(poll_id, candidate)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: provider.wallet.publicKey,
        candidateAccount: candidate_accountPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    await program.methods
      .vote(poll_id, candidate)
      .accounts({
        signer: provider.wallet.publicKey,
        pollAccount: poll_accountPda,
        candidateAccount: candidate_accountPda
      })
      .rpc();
  });
});
