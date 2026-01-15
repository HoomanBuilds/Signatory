/**
 * Lit Protocol Service
 * 
 * Handles PKP minting and Lit Actions for AI agent wallets.
 * Backend sponsors all Lit Protocol gas costs.
 * PKP access is controlled via Lit Actions that verify AgentNFT ownership.
 */

import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { 
  LitActionResource, 
  createSiweMessageWithRecaps, 
  generateAuthSig 
} from "@lit-protocol/auth-helpers";
import { LIT_ABILITY } from "@lit-protocol/constants";
import { ethers } from "ethers";
import { AGENT_SIGNER_LIT_ACTION } from "./lit-actions/agent-signer";

const LIT_NETWORK = process.env.LIT_NETWORK || "datil-test";
const LIT_RPC_URL = "https://yellowstone-rpc.litprotocol.com";

let litNodeClient: LitNodeClient | null = null;

/**
 * Get or create Lit Node Client connection
 */
export async function getLitNodeClient(): Promise<LitNodeClient> {
  if (litNodeClient && litNodeClient.ready) {
    return litNodeClient;
  }

  litNodeClient = new LitNodeClient({
    litNetwork: LIT_NETWORK as any,
    debug: false,
  });

  await litNodeClient.connect();
  return litNodeClient;
}

/**
 * Disconnect Lit Node Client
 */
export async function disconnectLitClient(): Promise<void> {
  if (litNodeClient) {
    await litNodeClient.disconnect();
    litNodeClient = null;
  }
}

/**
 * Initialize Lit Contracts with backend wallet (for sponsoring)
 */
export async function getLitContracts(
  backendPrivateKey: string
): Promise<LitContracts> {
  const provider = new ethers.JsonRpcProvider(LIT_RPC_URL);
  const wallet = new ethers.Wallet(backendPrivateKey, provider);

  const litContracts = new LitContracts({
    signer: wallet as any,
    network: LIT_NETWORK as any,
    debug: false,
  });

  await litContracts.connect();
  return litContracts;
}

/**
 * Mint a new PKP for an agent (backend keeps ownership)
 * 
 * @param backendPrivateKey - Backend wallet private key (sponsors gas)
 * @returns PKP details including public key and derived EVM address
 */
export async function mintPKPForAgent(
  backendPrivateKey: string
): Promise<{
  pkpTokenId: string;
  pkpPublicKey: string;
  evmAddress: string;
}> {
  console.log(`[Lit] Minting PKP (backend retains ownership for Lit Actions)`);

  const litContracts = await getLitContracts(backendPrivateKey);

  const mintResult = await litContracts.pkpNftContractUtils.write.mint();
  const pkpInfo = mintResult.pkp;

  console.log(`[Lit] PKP minted: ${pkpInfo.ethAddress}`);

  return {
    pkpTokenId: pkpInfo.tokenId,
    pkpPublicKey: pkpInfo.publicKey,
    evmAddress: pkpInfo.ethAddress,
  };
}

/**
 * Get session signatures for executing Lit Actions
 * Backend sponsors the capacity credits
 */
export async function getSessionSignatures(
  backendPrivateKey: string
): Promise<any> {
  const client = await getLitNodeClient();
  const provider = new ethers.JsonRpcProvider(LIT_RPC_URL);
  const wallet = new ethers.Wallet(backendPrivateKey, provider);

  const sessionSigs = await client.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    resourceAbilityRequests: [
      {
        resource: new LitActionResource("*"),
        ability: LIT_ABILITY.LitActionExecution,
      },
    ],
    authNeededCallback: async ({ resourceAbilityRequests, expiration, uri }) => {
      const toSign = await createSiweMessageWithRecaps({
        uri: uri!,
        expiration: expiration!,
        resources: resourceAbilityRequests!,
        walletAddress: wallet.address,
        nonce: await client.getLatestBlockhash(),
        litNodeClient: client,
      });

      return await generateAuthSig({
        signer: wallet as any,
        toSign,
      });
    },
  });

  return sessionSigs;
}

/**
 * Execute Lit Action to sign a transaction for an agent
 * Verifies caller owns the AgentNFT before signing
 * 
 * @param backendPrivateKey - Backend private key (sponsors capacity)
 * @param agentTokenId - The AgentNFT token ID
 * @param agentNFTContract - AgentNFT contract address on Cronos
 * @param callerAddress - Address of the user requesting signature
 * @param pkpPublicKey - The PKP public key
 * @param toSign - Message hash to sign (Uint8Array)
 * @param chain - Chain to verify ownership on
 */
export async function executeAgentSign(
  backendPrivateKey: string,
  agentTokenId: number,
  agentNFTContract: string,
  callerAddress: string,
  pkpPublicKey: string,
  toSign: Uint8Array,
  chain: string = "cronos"
): Promise<{ signature: string; recid: number }> {
  console.log(`[Lit] Executing agent sign for token ${agentTokenId}`);
  console.log(`[Lit] Caller: ${callerAddress}`);

  const client = await getLitNodeClient();
  const sessionSigs = await getSessionSignatures(backendPrivateKey);

  const result = await client.executeJs({
    sessionSigs,
    code: AGENT_SIGNER_LIT_ACTION,
    jsParams: {
      agentTokenId,
      agentNFTContract,
      callerAddress,
      toSign: Array.from(toSign),
      publicKey: pkpPublicKey,
      chain,
    },
  });

  console.log(`[Lit] Signature obtained`);

  const signature = result.signatures?.agentSignature;
  if (!signature) {
    throw new Error("No signature returned from Lit Action");
  }

  return {
    signature: signature.signature,
    recid: signature.recid,
  };
}

/**
 * Sign a transaction for an agent wallet
 * This is a higher-level function that handles the full signing flow
 */
export async function signAgentTransaction(
  backendPrivateKey: string,
  agentTokenId: number,
  agentNFTContract: string,
  callerAddress: string,
  pkpPublicKey: string,
  transaction: {
    to: string;
    value: string;
    data: string;
    chainId: number;
    nonce: number;
    gasLimit: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  },
  chain: string = "cronos"
): Promise<string> {
  console.log(`[Lit] Signing transaction for agent ${agentTokenId}`);

  const serializedTx = ethers.Transaction.from(transaction).unsignedSerialized;
  const txHash = ethers.keccak256(serializedTx);
  const toSign = ethers.getBytes(txHash);

  const { signature, recid } = await executeAgentSign(
    backendPrivateKey,
    agentTokenId,
    agentNFTContract,
    callerAddress,
    pkpPublicKey,
    toSign,
    chain
  );

  const signedTx = ethers.Transaction.from({
    ...transaction,
    signature: {
      r: "0x" + signature.slice(0, 64),
      s: "0x" + signature.slice(64, 128),
      v: recid + 27,
    },
  }).serialized;

  return signedTx;
}

/**
 * Mint Capacity Credits (needed for Lit operations)
 */
export async function mintCapacityCredits(
  backendPrivateKey: string
): Promise<string> {
  const litContracts = await getLitContracts(backendPrivateKey);

  const result = await litContracts.mintCapacityCreditsNFT({
    requestsPerKilosecond: 10,
    daysUntilUTCMidnightExpiration: 30,
  });

  console.log(`[Lit] Capacity Credits minted: ${result.capacityTokenIdStr}`);
  return result.capacityTokenIdStr;
}

/**
 * Check if backend wallet has sufficient balance for Lit operations
 */
export async function checkLitBalance(
  backendPrivateKey: string
): Promise<{ balance: string; hasBalance: boolean }> {
  const provider = new ethers.JsonRpcProvider(LIT_RPC_URL);
  const wallet = new ethers.Wallet(backendPrivateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  
  return {
    balance: ethers.formatEther(balance),
    hasBalance: balance > BigInt(0),
  };
}

/**
 * Get PKP wallet address from public key
 */
export function getPKPAddress(pkpPublicKey: string): string {
  const pubKeyNoPrefix = pkpPublicKey.startsWith("0x")
    ? pkpPublicKey.slice(2)
    : pkpPublicKey;
  
  const pubKeyBytes = Buffer.from(pubKeyNoPrefix, "hex");
  const addressBytes = ethers.keccak256(pubKeyBytes.slice(1));
  
  return "0x" + addressBytes.slice(-40);
}
