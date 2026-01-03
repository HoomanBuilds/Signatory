import { ethers } from "ethers";
import contractAddresses from "@/constants/contractAddresses.json";

// Get contract addresses for current chain
export function getContractAddresses(chainId: number) {
  const chainIdStr = chainId.toString() as keyof typeof contractAddresses;
  const addresses = contractAddresses[chainIdStr];
  if (!addresses) {
    throw new Error(
      `No contract addresses found for chain ID ${chainId}. Please switch to Localhost (31337), Sepolia (11155111), or Cronos Testnet (338).`
    );
  }
  return addresses;
}

// Get provider
export function getProvider() {
  if (typeof window === "undefined") return null;

  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }

  // Fallback to localhost
  return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
}

// Request account access - Prioritize MetaMask
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No wallet detected. Please install MetaMask.");
  }

  // If multiple wallets, try to use MetaMask specifically
  let provider;
  if (window.ethereum.providers?.length) {
    // Multiple wallets detected, find MetaMask
    const metamaskProvider = window.ethereum.providers.find(
      (p: any) => p.isMetaMask
    );
    if (metamaskProvider) {
      provider = new ethers.BrowserProvider(metamaskProvider);
    } else {
      provider = new ethers.BrowserProvider(window.ethereum);
    }
  } else {
    provider = new ethers.BrowserProvider(window.ethereum);
  }

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return {
    address,
    chainId: Number(network.chainId),
    signer,
    provider,
  };
}

// Switch to localhost network
export async function switchToLocalhost() {
  if (!window.ethereum) {
    throw new Error("No wallet detected");
  }

  // Get the correct provider (MetaMask if multiple wallets)
  let ethereum = window.ethereum;
  if (window.ethereum.providers?.length) {
    const metamaskProvider = window.ethereum.providers.find(
      (p: any) => p.isMetaMask
    );
    if (metamaskProvider) {
      ethereum = metamaskProvider;
    }
  }

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x7a69" }], // 31337 in hex
    });
  } catch (error: any) {
    // Chain not added, add it
    if (error.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x7a69",
            chainName: "Localhost 8545",
            nativeCurrency: {
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["http://127.0.0.1:8545"],
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
