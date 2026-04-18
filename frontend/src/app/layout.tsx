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
import { hardhat, sepolia, bscTestnet, type Chain } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { CHAIN_ID } from "@/lib/config";
import { createSiweMessage } from "viem/siwe";
import { useState, useEffect, useMemo } from "react";
import { ReactLenis } from "lenis/react";

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
    case 97:
      return bscTestnet;
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Unbounded:wght@200;300;400;500;600;700;800;900&family=Pixelify+Sans:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-grain relative">
        <ReactLenis root options={{ lerp: 0.08, duration: 1.4, smoothWheel: true }}>
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
        </ReactLenis>
      </body>
    </html>
  );
}
