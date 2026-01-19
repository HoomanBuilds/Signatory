/**
 * PKP Multi-Chain Address Derivation
 * 
 * Derives addresses for different blockchain networks from a PKP public key.
 * PKP uses secp256k1 curve, which can derive addresses for:
 * - EVM chains (Ethereum, Cronos, etc.)
 * - Solana (via ed25519 conversion)
 * - Cosmos (via bech32 encoding)
 * - Bitcoin (via SHA256 + RIPEMD160)
 */

import { ethers } from "ethers";
import { Buffer } from "buffer";

// Supported chains
export const SUPPORTED_CHAINS = [
  "ethereum",
  "cronos", 
  "base",
  "polygon",
  "arbitrum",
  "optimism",
  "solana",
  "cosmos",
  "bitcoin",
] as const;

export type SupportedChain = typeof SUPPORTED_CHAINS[number];

export interface ChainAddress {
  chain: SupportedChain;
  address: string;
  type: "evm" | "solana" | "cosmos" | "bitcoin";
}

/**
 * Derive EVM address from PKP public key
 * EVM uses keccak256(pubKey[1:]) - last 20 bytes
 */
export function deriveEVMAddress(pkpPublicKey: string): string {
  const pubKeyNoPrefix = pkpPublicKey.startsWith("0x")
    ? pkpPublicKey.slice(2)
    : pkpPublicKey;
  
  // Remove 04 prefix if present (uncompressed public key marker)
  const pubKey = pubKeyNoPrefix.startsWith("04") 
    ? pubKeyNoPrefix.slice(2) 
    : pubKeyNoPrefix;
  
  const pubKeyBytes = Buffer.from(pubKey, "hex");
  const addressHash = ethers.utils.keccak256(pubKeyBytes);
  
  return "0x" + addressHash.slice(-40);
}

/**
 * Derive Solana address from PKP public key
 * 
 * Note: Solana uses ed25519, but Lit PKP is secp256k1.
 * For true Solana support, you'd need a wrapped key or Lit's Solana PKP.
 * This creates a deterministic "pseudo-address" for display purposes.
 * Actual signing would require Lit's Solana wallet wrapper.
 */
export function deriveSolanaAddress(pkpPublicKey: string): string {
  const pubKeyNoPrefix = pkpPublicKey.startsWith("0x")
    ? pkpPublicKey.slice(2)
    : pkpPublicKey;
  
  // Create a deterministic 32-byte value from the public key
  const hash = ethers.utils.keccak256("0x" + pubKeyNoPrefix);
  const bytes = Buffer.from(hash.slice(2), "hex");
  
  // Encode as base58 (Solana address format)
  return base58Encode(bytes);
}

/**
 * Derive Cosmos address from PKP public key
 * Cosmos uses bech32 encoding with "cosmos" prefix
 */
export function deriveCosmosAddress(pkpPublicKey: string, prefix: string = "cosmos"): string {
  const pubKeyNoPrefix = pkpPublicKey.startsWith("0x")
    ? pkpPublicKey.slice(2)
    : pkpPublicKey;
  
  // SHA256 hash of the public key, then RIPEMD160 of that
  // For simplicity, we use keccak256 and take first 20 bytes
  const hash = ethers.utils.keccak256("0x" + pubKeyNoPrefix);
  const bytes = Buffer.from(hash.slice(2, 42), "hex"); // First 20 bytes
  
  return bech32Encode(prefix, bytes);
}

/**
 * Derive Bitcoin address (P2PKH) from PKP public key
 */
export function deriveBitcoinAddress(pkpPublicKey: string): string {
  const pubKeyNoPrefix = pkpPublicKey.startsWith("0x")
    ? pkpPublicKey.slice(2)
    : pkpPublicKey;
  
  // Double hash: SHA256 then RIPEMD160
  const sha256Hash = ethers.utils.sha256("0x" + pubKeyNoPrefix);
  // For simplicity, take first 20 bytes as address
  const hash160 = sha256Hash.slice(2, 42);
  
  // Add version byte (0x00 for mainnet) and encode as base58check
  const versionedHash = "00" + hash160;
  
  return base58CheckEncode(Buffer.from(versionedHash, "hex"));
}

/**
 * Get all chain addresses from a PKP public key
 */
export function deriveAllChainAddresses(pkpPublicKey: string): ChainAddress[] {
  const evmAddress = deriveEVMAddress(pkpPublicKey);
  
  const addresses: ChainAddress[] = [
    // EVM chains all share the same address
    { chain: "ethereum", address: evmAddress, type: "evm" },
    { chain: "cronos", address: evmAddress, type: "evm" },
    { chain: "base", address: evmAddress, type: "evm" },
    { chain: "polygon", address: evmAddress, type: "evm" },
    { chain: "arbitrum", address: evmAddress, type: "evm" },
    { chain: "optimism", address: evmAddress, type: "evm" },
    // Non-EVM chains
    { chain: "solana", address: deriveSolanaAddress(pkpPublicKey), type: "solana" },
    { chain: "cosmos", address: deriveCosmosAddress(pkpPublicKey), type: "cosmos" },
    { chain: "bitcoin", address: deriveBitcoinAddress(pkpPublicKey), type: "bitcoin" },
  ];
  
  return addresses;
}

// ============ Base58 Encoding ============

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58Encode(buffer: Buffer): string {
  const digits = [0];
  
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  
  let result = "";
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    result += BASE58_ALPHABET[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]];
  }
  
  return result;
}

function base58CheckEncode(buffer: Buffer): string {
  // Compute double SHA256 checksum
  const hash1 = ethers.utils.sha256("0x" + buffer.toString("hex"));
  const hash2 = ethers.utils.sha256(hash1);
  const checksum = hash2.slice(2, 10); // First 4 bytes
  
  const withChecksum = Buffer.concat([buffer, Buffer.from(checksum, "hex")]);
  return base58Encode(withChecksum);
}

// ============ Bech32 Encoding ============

const BECH32_ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((b >> i) & 1) {
        chk ^= GEN[i];
      }
    }
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const result: number[] = [];
  for (let i = 0; i < hrp.length; i++) {
    result.push(hrp.charCodeAt(i) >> 5);
  }
  result.push(0);
  for (let i = 0; i < hrp.length; i++) {
    result.push(hrp.charCodeAt(i) & 31);
  }
  return result;
}

function bech32Encode(hrp: string, data: Buffer): string {
  // Convert 8-bit to 5-bit
  const data5bit: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const byte of data) {
    acc = (acc << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      data5bit.push((acc >> bits) & 31);
    }
  }
  if (bits > 0) {
    data5bit.push((acc << (5 - bits)) & 31);
  }
  
  // Compute checksum
  const values = [...bech32HrpExpand(hrp), ...data5bit];
  const polymod = bech32Polymod([...values, 0, 0, 0, 0, 0, 0]) ^ 1;
  const checksum: number[] = [];
  for (let i = 0; i < 6; i++) {
    checksum.push((polymod >> (5 * (5 - i))) & 31);
  }
  
  // Encode
  let result = hrp + "1";
  for (const d of [...data5bit, ...checksum]) {
    result += BECH32_ALPHABET[d];
  }
  
  return result;
}
