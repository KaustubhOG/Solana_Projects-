import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Favorites } from "../target/types/favorites";

describe("favorites", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Favorites as Program<Favorites>;

  const [favoritesPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from([102, 97, 118, 111, 114, 105, 116, 101, 115]),
      provider.wallet.publicKey.toBuffer()
    ],
    program.programId
  );

  it("successfully adds favorites", async () => {
    const number = new anchor.BN(1);
    const color = "blue_1";
    const hobbies = "test_1";

    await program.methods
      .addFavorites(number, color, hobbies)
      .accounts({
        user: provider.wallet.publicKey,
        favorites: favoritesPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("fails to add favorites with unauthorized signer", async () => {
    const number = new anchor.BN(2);
    const color = "blue_2";
    const hobbies = "test_2";

    try {
      await program.methods
        .addFavorites(number, color, hobbies)
        .accounts({
        user: anchor.web3.Keypair.generate().publicKey,
        favorites: favoritesPda,
        systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc();
      throw new Error("Expected to fail");
    } catch (err: any) {
      if (err.message === "Expected to fail") throw err;
    }
  });

  it("handles add favorites with minimal values", async () => {
    const number = new anchor.BN(0);
    const color = "";
    const hobbies = "";

    await program.methods
      .addFavorites(number, color, hobbies)
      .accounts({
        user: provider.wallet.publicKey,
        favorites: favoritesPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });
});
