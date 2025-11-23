"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

const PROGRAM_ID = "GE3yf9XVmbpb4xJq73kJrg2tnVEFe5kSWKs5pCq6cCRA";

const IDL = {
  version: "0.1.0",
  name: "favorites",
  instructions: [
    {
      name: "addFavorites",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "favorites", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "number", type: "u64" },
        { name: "color", type: "string" },
        { name: "hobbies", type: "string" },
      ],
    },
  ],
  accounts: [
    {
      name: "Favorites",
      type: {
        kind: "struct",
        fields: [
          { name: "number", type: "u64" },
          { name: "color", type: "string" },
          { name: "hobbies", type: "string" },
        ],
      },
    },
  ],
};

export default function Home() {
  const [number, setNumber] = useState("");
  const [color, setColor] = useState("");
  const [hobby, setHobby] = useState("");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();

  // Fetch favorites when wallet connects
  useEffect(() => {
    if (publicKey) {
      fetchFavorites();
    }
  }, [publicKey]);

  async function fetchFavorites() {
    if (!publicKey) return;

    setFetchLoading(true);
    try {
      const programId = new PublicKey(PROGRAM_ID);
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("favorites"), publicKey.toBuffer()],
        programId
      );

      const provider = new anchor.AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions } as any,
        { commitment: "confirmed" }
      );

      const program = new anchor.Program(IDL as any, programId, provider);
      const account = await program.account.favorites.fetch(pda);

      setFavorites({
        number: account.number.toString(),
        color: account.color,
        hobbies: account.hobbies,
      });
    } catch (error) {
      console.log("No favorites found yet");
      setFavorites(null);
    } finally {
      setFetchLoading(false);
    }
  }

  async function handleSubmit() {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      return alert("Connect wallet!");
    }

    setLoading(true);
    try {
      const programId = new PublicKey(PROGRAM_ID);
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("favorites"), publicKey.toBuffer()],
        programId
      );

      const provider = new anchor.AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { commitment: "confirmed" }
      );

      const program = new anchor.Program(IDL as any, programId, provider);

      const tx = await program.methods
        .addFavorites(new anchor.BN(number), color, hobby)
        .accounts({
          user: publicKey,
          favorites: pda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert(`Success! ${tx}`);
      setNumber("");
      setColor("");
      setHobby("");

      // Refresh favorites after submission
      await fetchFavorites();
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Add Favorites</h1>

        {/* Display current favorites */}
        {publicKey && (
          <div className="p-4 bg-gray-100 rounded border">
            <h2 className="font-bold mb-2 text-blue-900">Current Favorites:</h2>
            {fetchLoading ? (
              <p>Loading...</p>
            ) : favorites ? (
              <div className="space-y-1 text-blue-900">
                <p>
                  <strong>Number:</strong> {favorites.number}
                </p>
                <p>
                  <strong>Color:</strong> {favorites.color}
                </p>
                <p>
                  <strong>Hobby:</strong> {favorites.hobbies}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No favorites added yet</p>
            )}
          </div>
        )}

        <input
          type="number"
          placeholder="Number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          disabled={loading}
          className="w-full p-3 border rounded"
        />

        <input
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          disabled={loading}
          className="w-full p-3 border rounded"
        />

        <input
          placeholder="Hobby"
          value={hobby}
          onChange={(e) => setHobby(e.target.value)}
          disabled={loading}
          className="w-full p-3 border rounded"
        />

        <button
          onClick={handleSubmit}
          disabled={!publicKey || loading}
          className="w-full p-3 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Submit"}
        </button>

        <button
          onClick={fetchFavorites}
          disabled={!publicKey || fetchLoading}
          className="w-full p-3 bg-green-600 text-white rounded disabled:bg-gray-400"
        >
          {fetchLoading ? "Loading..." : "Refresh Favorites"}
        </button>
      </div>
      <a href="https://explorer.solana.com/address/GE3yf9XVmbpb4xJq73kJrg2tnVEFe5kSWKs5pCq6cCRA?cluster=devnet">
        Check Contract On Solana Explorer
      </a>
    </main>
  );
}
