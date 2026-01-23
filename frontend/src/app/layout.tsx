"use client";

import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
  type AuthenticationStatus,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { hardhat, sepolia, type Chain } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { CHAIN_ID } from "@/lib/config";
import { createSiweMessage } from "viem/siwe";
import { useState, useEffect, useMemo } from "react";

// Define Cronos Testnet chain
const cronosTestnet: Chain = {
  id: 338,
  name: "Cronos Testnet",
  nativeCurrency: {
    name: "Cronos",
    symbol: "TCRO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://evm-t3.cronos.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Cronos Explorer",
      url: "https://explorer.cronos.org/testnet",
    },
  },
  testnet: true,
};

// Select chain based on environment variable
const getSelectedChain = () => {
  switch (CHAIN_ID) {
    case 11155111:
      return sepolia;
    case 338:
      return cronosTestnet;
    default:
      return hardhat;
  }
};

const selectedChain = getSelectedChain();

const config = getDefaultConfig({
  appName: "SIGNATORY",
  projectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [selectedChain],
  ssr: true,
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [authStatus, setAuthStatus] =
    useState<AuthenticationStatus>("loading");

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (data.authenticated) {
          setAuthStatus("authenticated");
        } else {
          setAuthStatus("unauthenticated");
        }
      } catch {
        setAuthStatus("unauthenticated");
      }
    };

    checkSession();
  }, []);

  // Create the authentication adapter
  const authAdapter = useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => {
          const response = await fetch("/api/auth/nonce");
          const data = await response.json();
          return data.nonce;
        },

        createMessage: ({ nonce, address, chainId }) => {
          return createSiweMessage({
            domain: window.location.host,
            address,
            statement: "Sign in to SIGNATORY",
            uri: window.location.origin,
            version: "1",
            chainId,
            nonce,
          });
        },

        verify: async ({ message, signature }) => {
          try {
            const response = await fetch("/api/auth/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message, signature }),
            });

            if (response.ok) {
              setAuthStatus("authenticated");
              return true;
            }
            return false;
          } catch {
            return false;
          }
        },

        signOut: async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          setAuthStatus("unauthenticated");
        },
      }),
    []
  );

  return (
    <html lang="en">
      <body className="antialiased">
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitAuthenticationProvider
              adapter={authAdapter}
              status={authStatus}
            >
              <RainbowKitProvider>{children}</RainbowKitProvider>
            </RainbowKitAuthenticationProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
