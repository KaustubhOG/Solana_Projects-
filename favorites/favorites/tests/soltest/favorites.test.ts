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

  it("should add_favorites successfully", async () => {
    await program.methods
      .addFavorites(new anchor.BN(1), "example", "example")
      .accounts({
      user: provider.wallet.publicKey,
      favorites: favoritesPda,
      systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });

  it("should fail add_favorites with invalid signer", async () => {
    try {
      await program.methods
        .addFavorites(new anchor.BN(1), "example", "example")
        .accounts({
      user: anchor.web3.Keypair.generate().publicKey,
      favorites: favoritesPda,
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
