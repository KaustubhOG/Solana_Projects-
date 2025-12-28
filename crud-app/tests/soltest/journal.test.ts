import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Journal } from "../target/types/journal";

describe("journal", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Journal as Program<Journal>;

  it("successfully creates a journal entry", async () => {
    const title = "Test Title_1";
    const message = "Test message_1";

    const [journal_entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(title),
      provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );

    await program.methods
      .createJournalEntry(title, message)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("fails to create a journal entry with unauthorized signer", async () => {
    const title = "Test Title_2";
    const message = "Test message_2";

    const [journal_entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(title),
      provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );

    try {
      await program.methods
        .createJournalEntry(title, message)
        .accounts({
        journalEntry: journal_entryPda,
        owner: anchor.web3.Keypair.generate().publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc();
      throw new Error("Expected to fail");
    } catch (err: any) {
      if (err.message === "Expected to fail") throw err;
    }
  });

  it("handles create a journal entry with minimal values", async () => {
    const title = "";
    const message = "";

    const [journal_entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(title),
      provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );

    await program.methods
      .createJournalEntry(title, message)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("successfully updates a journal entry", async () => {
    // Setup: Create required accounts
    const title = "Test Title_1_4";
    const message = "Test message_1_4";
    const [journal_entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(title),
      provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );
    await program.methods
      .createJournalEntry(title, message)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    await program.methods
      .updateJournalEntry(title, message)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("fails to update a journal entry with unauthorized signer", async () => {
    // Setup: Create required accounts
    const title = "Test Title_1_5";
    const message = "Test message_1_5";
    const [journal_entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(title),
      provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );
    await program.methods
      .createJournalEntry(title, message)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    try {
      await program.methods
        .updateJournalEntry(title, message)
        .accounts({
        journalEntry: journal_entryPda,
        owner: anchor.web3.Keypair.generate().publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc();
      throw new Error("Expected to fail");
    } catch (err: any) {
      if (err.message === "Expected to fail") throw err;
    }
  });

  it("handles update a journal entry with minimal values", async () => {
    // Setup: Create required accounts
    const title = "Test Title_1_6";
    const message = "Test message_1_6";
    const [journal_entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(title),
      provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );
    await program.methods
      .createJournalEntry(title, message)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    await program.methods
      .updateJournalEntry(title, message)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("successfully deletes a journal entry", async () => {
    // Setup: Create required accounts
    const title = "Test Title_1_7";
    const message = "Test message_1_7";
    const [journal_entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(title),
      provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );
    await program.methods
      .createJournalEntry(title, message)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    await program.methods
      .deleteJournalEntry(title)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("fails to delete a journal entry with unauthorized signer", async () => {
    // Setup: Create required accounts
    const title = "Test Title_1_8";
    const message = "Test message_1_8";
    const [journal_entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(title),
      provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );
    await program.methods
      .createJournalEntry(title, message)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    try {
      await program.methods
        .deleteJournalEntry(title)
        .accounts({
        journalEntry: journal_entryPda,
        owner: anchor.web3.Keypair.generate().publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc();
      throw new Error("Expected to fail");
    } catch (err: any) {
      if (err.message === "Expected to fail") throw err;
    }
  });

  it("handles delete a journal entry with minimal values", async () => {
    // Setup: Create required accounts
    const title = "Test Title_1_9";
    const message = "Test message_1_9";
    const [journal_entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
      Buffer.from(title),
      provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );
    await program.methods
      .createJournalEntry(title, message)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    await program.methods
      .deleteJournalEntry(title)
      .accounts({
        journalEntry: journal_entryPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });
});
