"use client";

import { useMemo, useState, useEffect } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {mounted && (
            <div className="fixed top-4 right-4 z-50">
              <WalletMultiButton />
            </div>
          )}
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}