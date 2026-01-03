// Chain configuration
export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
  ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID)
  : 31337;

export const CHAIN_ID_STRING = CHAIN_ID.toString() as "31337" | "11155111" | "338";

// Check if we're on localhost, Sepolia, or Cronos Testnet
export const IS_LOCALHOST = CHAIN_ID === 31337;
export const IS_SEPOLIA = CHAIN_ID === 11155111;
export const IS_CRONOS_TESTNET = CHAIN_ID === 338;
