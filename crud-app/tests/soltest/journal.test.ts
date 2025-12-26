import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Journal } from "../target/types/journal";

describe("journal", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Journal as Program<Journal>;

  const [journal_entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(title),
      provider.wallet.publicKey.toBuffer()
    ],
    program.programId
  );

  it("should create_journal_entry successfully", async () => {
    await program.methods
      .createJournalEntry("example", "example")
      .accounts({
      journalEntry: journal_entryPda,
      owner: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("should fail create_journal_entry with invalid signer", async () => {
    try {
      await program.methods
        .createJournalEntry("example", "example")
        .accounts({
      journalEntry: journal_entryPda,
      owner: anchor.web3.Keypair.generate().publicKey,
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
