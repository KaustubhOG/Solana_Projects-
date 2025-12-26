import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";

describe("voting", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Voting as Program<Voting>;

  const [candidate_accountPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(candidate)
    ],
    program.programId
  );

  it("should initialize_candidate successfully", async () => {
    await program.methods
      .initializeCandidate(new anchor.BN(1), "example")
      .accounts({
      signer: provider.wallet.publicKey,
      pollAccount: provider.wallet.publicKey,
      candidateAccount: candidate_accountPda,
      systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("should fail initialize_candidate with invalid signer", async () => {
    try {
      await program.methods
        .initializeCandidate(new anchor.BN(1), "example")
        .accounts({
      signer: anchor.web3.Keypair.generate().publicKey,
      pollAccount: anchor.web3.Keypair.generate().publicKey,
      candidateAccount: candidate_accountPda,
      systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc();
      throw new Error("Expected transaction to fail");
    } catch (err: any) {
      if (err.message === "Expected transaction to fail") {
        throw err;
      }
      // Expected to fail due to invalid signer
    }
  });
});
