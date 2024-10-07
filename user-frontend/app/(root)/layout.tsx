"use client";
import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import Appbar from '@/components/Appbar';
import { SignInProvider } from '@/components/SignInContext'

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = "https://solana-devnet.g.alchemy.com/v2/J13YRjxHrE0UwQw0qSGxjA_YVoKmLvxk";

  const wallets = useMemo(
    () => [],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SignInProvider>
            <Appbar />
            {children}
          </SignInProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}