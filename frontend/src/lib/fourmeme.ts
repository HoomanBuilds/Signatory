/**
 * Four.meme Integration Module
 *
 * Handles authentication, token creation, buying, selling, and querying
 * on the Four.meme meme token launchpad (BSC Mainnet).
 */

import { ethers } from "ethers";
import { getBscMainnetProvider } from "./ethers-provider";
import { signAgentTransaction, executeAgentSign } from "./lit-protocol";
import { generateMemeTokenImage } from "./openai";
import TokenManager2ABI from "../constants/fourmeme/TokenManager2.json";
import TokenManagerHelper3ABI from "../constants/fourmeme/TokenManagerHelper3.json";

// Four.meme API
const FOURMEME_API = "https://four.meme/meme-api/v1";

// Four.meme contracts on BSC Mainnet (chainId 56)
const TOKEN_MANAGER_V2 = "0x5c952063c7fc8610FFDB798152D69F0B9550762b";
const TOKEN_MANAGER_HELPER3 = "0xF251F83e40a78868FcfA3FA4599Dad6494E46034";
const BSC_MAINNET_CHAIN_ID = 56;
const BSC_CREATION_FEE = ethers.utils.parseEther("0.01"); // 0.01 BNB

// Session auth token
let fourMemeAccessToken: string | null = null;
let fourMemeTokenAddress: string | null = null;

// ============================================================
// Authentication
// ============================================================

export async function getFourMemeNonce(): Promise<string> {
  const res = await fetch(`${FOURMEME_API}/public/user/login/nonce`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Four.meme nonce request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data?.nonce || data.nonce;
}

export async function loginFourMeme(
  address: string,
  signature: string,
  nonce: string
): Promise<string> {
  const res = await fetch(`${FOURMEME_API}/public/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, signature, nonce }),
  });

  if (!res.ok) {
    throw new Error(`Four.meme login failed: ${res.status}`);
  }

  const data = await res.json();
  const token = data.data?.accessToken || data.accessToken;
  fourMemeAccessToken = token;
  fourMemeTokenAddress = address;
  return token;
}

export async function authenticateFourMeme(
  backendPrivateKey: string,
  agentTokenId: number,
  agentNFTContract: string,
  callerAddress: string,
  pkpPublicKey: string,
  pkpAddress: string,
  verificationChainId: number,
  verificationRpcUrl: string
): Promise<string> {
  if (fourMemeAccessToken && fourMemeTokenAddress === pkpAddress) {
    return fourMemeAccessToken;
  }

  console.log("[FourMeme] Authenticating PKP wallet:", pkpAddress);

  const nonce = await getFourMemeNonce();
  console.log("[FourMeme] Got nonce:", nonce);

  // Sign the nonce message with PKP
  const message = `You are sign in Meme ${nonce}`;
  const messageHash = ethers.utils.hashMessage(ethers.utils.toUtf8Bytes(message));
  const toSign = ethers.utils.arrayify(messageHash);

  const { signature, recid } = await executeAgentSign(
    backendPrivateKey,
    agentTokenId,
    agentNFTContract,
    callerAddress,
    pkpPublicKey,
    toSign,
    "bsc",
    verificationChainId,
    verificationRpcUrl
  );

  const cleanSig = signature.startsWith("0x") ? signature.slice(2) : signature;
  const r = cleanSig.slice(0, 64);
  const s = cleanSig.slice(64, 128);
  const v = (recid + 27).toString(16).padStart(2, "0");
  const fullSignature = "0x" + r + s + v;

  const accessToken = await loginFourMeme(pkpAddress, fullSignature, nonce);
  console.log("[FourMeme] Authenticated successfully");

  return accessToken;
}

function getAuthHeaders(): Record<string, string> {
  if (!fourMemeAccessToken) {
    throw new Error("Not authenticated with Four.meme. Call authenticateFourMeme first.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${fourMemeAccessToken}`,
  };
}

// Common params for all agent operations
interface AgentParams {
  backendPrivateKey: string;
  agentTokenId: number;
  agentNFTContract: string;
  callerAddress: string;
  pkpPublicKey: string;
  pkpAddress: string;
  verificationChainId: number;
  verificationRpcUrl: string;
}

// ============================================================
// Token Creation
// ============================================================

async function uploadTokenImage(imageBuffer: Buffer): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/png" });
  formData.append("image", blob, "token-image.png");

  const res = await fetch(`${FOURMEME_API}/private/tool/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${fourMemeAccessToken}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Four.meme image upload failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data?.url || data.url;
}

export async function createMemeToken(
  params: AgentParams & {
    name: string;
    ticker: string;
    description: string;
    imageUrl?: string;
  }
): Promise<{ txHash: string; tokenAddress?: string }> {
  const {
    name, ticker, description, imageUrl,
    backendPrivateKey, agentTokenId, agentNFTContract,
    callerAddress, pkpPublicKey, pkpAddress,
    verificationChainId, verificationRpcUrl,
  } = params;

  await authenticateFourMeme(
    backendPrivateKey, agentTokenId, agentNFTContract,
    callerAddress, pkpPublicKey, pkpAddress,
    verificationChainId, verificationRpcUrl
  );

  // Get or generate image
  let finalImageUrl = imageUrl;
  if (!finalImageUrl) {
    console.log("[FourMeme] Generating token image with DALL-E...");
    const imageBuffer = await generateMemeTokenImage(name, description);
    finalImageUrl = await uploadTokenImage(imageBuffer);
    console.log("[FourMeme] Image uploaded:", finalImageUrl);
  }

  // Call create API
  const createRes = await fetch(`${FOURMEME_API}/private/token/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name,
      shortName: ticker,
      desc: description,
      imageUrl: finalImageUrl,
      label: "MEME",
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Four.meme token creation API failed: ${createRes.status} - ${err}`);
  }

  const createData = await createRes.json();
  const createArg = createData.data?.createArg || createData.createArg;
  const sig = createData.data?.signature || createData.signature;

  if (!createArg || !sig) {
    throw new Error("Four.meme did not return createArg/signature");
  }

  // Build on-chain transaction
  const provider = getBscMainnetProvider();
  const tokenManager = new ethers.Contract(TOKEN_MANAGER_V2, TokenManager2ABI, provider);
  const txData = tokenManager.interface.encodeFunctionData("createToken", [createArg, sig]);

  const nonce = await provider.getTransactionCount(pkpAddress);
  const gasPrice = await provider.getGasPrice();

  const tx = {
    to: TOKEN_MANAGER_V2,
    value: BSC_CREATION_FEE.toString(),
    data: txData,
    chainId: BSC_MAINNET_CHAIN_ID,
    nonce,
    gasLimit: "500000",
    gasPrice: gasPrice.toString(),
  };

  const signedTx = await signAgentTransaction(
    backendPrivateKey, agentTokenId, agentNFTContract,
    callerAddress, pkpPublicKey, tx, "bsc",
    verificationChainId, verificationRpcUrl
  );

  const txResponse = await provider.sendTransaction(signedTx);
  console.log("[FourMeme] Token creation tx:", txResponse.hash);

  const receipt = await txResponse.wait(1);
  let tokenAddress: string | undefined;

  const tokenCreateTopic = ethers.utils.id(
    "TokenCreate(address,address,uint256,string,string,uint256,uint256,uint256)"
  );
  const createLog = receipt.logs.find(
    (log: ethers.providers.Log) => log.topics[0] === tokenCreateTopic
  );
  if (createLog) {
    const decoded = tokenManager.interface.parseLog(createLog);
    tokenAddress = decoded.args.token;
  }

  return { txHash: txResponse.hash, tokenAddress };
}

// ============================================================
// Buy / Sell
// ============================================================

export async function buyMemeToken(
  params: AgentParams & {
    tokenAddress: string;
    amountBNB: string;
    slippage?: number;
  }
): Promise<{ txHash: string; estimatedTokens?: string }> {
  const {
    tokenAddress, amountBNB, slippage = 5,
    backendPrivateKey, agentTokenId, agentNFTContract,
    callerAddress, pkpPublicKey, pkpAddress,
    verificationChainId, verificationRpcUrl,
  } = params;

  const provider = getBscMainnetProvider();
  const fundsWei = ethers.utils.parseEther(amountBNB);

  // Price estimate via Helper3
  const helper = new ethers.Contract(TOKEN_MANAGER_HELPER3, TokenManagerHelper3ABI, provider);
  let estimatedTokens: string | undefined;
  try {
    const estimate = await helper.tryBuy(tokenAddress, 0, fundsWei);
    estimatedTokens = ethers.utils.formatUnits(estimate.amountFunds || estimate[0], 18);
  } catch (e) {
    console.warn("[FourMeme] tryBuy estimate failed, proceeding without:", e);
  }

  const minAmount = estimatedTokens
    ? ethers.utils.parseEther(estimatedTokens).mul(100 - slippage).div(100)
    : ethers.BigNumber.from(0);

  const tokenManager = new ethers.Contract(TOKEN_MANAGER_V2, TokenManager2ABI, provider);
  const txData = tokenManager.interface.encodeFunctionData("buyTokenAMAP", [
    0, tokenAddress, fundsWei, minAmount,
  ]);

  const nonce = await provider.getTransactionCount(pkpAddress);
  const gasPrice = await provider.getGasPrice();

  const tx = {
    to: TOKEN_MANAGER_V2,
    value: fundsWei.toString(),
    data: txData,
    chainId: BSC_MAINNET_CHAIN_ID,
    nonce,
    gasLimit: "300000",
    gasPrice: gasPrice.toString(),
  };

  const signedTx = await signAgentTransaction(
    backendPrivateKey, agentTokenId, agentNFTContract,
    callerAddress, pkpPublicKey, tx, "bsc",
    verificationChainId, verificationRpcUrl
  );

  const txResponse = await provider.sendTransaction(signedTx);
  console.log("[FourMeme] Buy tx:", txResponse.hash);
  await txResponse.wait(1);

  return { txHash: txResponse.hash, estimatedTokens };
}

export async function sellMemeToken(
  params: AgentParams & {
    tokenAddress: string;
    tokenAmount: string;
    slippage?: number;
  }
): Promise<{ txHash: string; estimatedBNB?: string }> {
  const {
    tokenAddress, tokenAmount, slippage = 5,
    backendPrivateKey, agentTokenId, agentNFTContract,
    callerAddress, pkpPublicKey, pkpAddress,
    verificationChainId, verificationRpcUrl,
  } = params;

  const provider = getBscMainnetProvider();
  const amountWei = ethers.utils.parseEther(tokenAmount);

  const helper = new ethers.Contract(TOKEN_MANAGER_HELPER3, TokenManagerHelper3ABI, provider);
  let estimatedBNB: string | undefined;
  try {
    const estimate = await helper.trySell(tokenAddress, amountWei);
    estimatedBNB = ethers.utils.formatEther(estimate.amountFunds || estimate[0]);
  } catch (e) {
    console.warn("[FourMeme] trySell estimate failed, proceeding without:", e);
  }

  const minFunds = estimatedBNB
    ? ethers.utils.parseEther(estimatedBNB).mul(100 - slippage).div(100)
    : ethers.BigNumber.from(0);

  const tokenManager = new ethers.Contract(TOKEN_MANAGER_V2, TokenManager2ABI, provider);
  const txData = tokenManager.interface.encodeFunctionData("sellToken", [
    0, tokenAddress, amountWei, minFunds, 0, ethers.constants.AddressZero,
  ]);

  const nonce = await provider.getTransactionCount(pkpAddress);
  const gasPrice = await provider.getGasPrice();

  const tx = {
    to: TOKEN_MANAGER_V2,
    value: "0",
    data: txData,
    chainId: BSC_MAINNET_CHAIN_ID,
    nonce,
    gasLimit: "300000",
    gasPrice: gasPrice.toString(),
  };

  const signedTx = await signAgentTransaction(
    backendPrivateKey, agentTokenId, agentNFTContract,
    callerAddress, pkpPublicKey, tx, "bsc",
    verificationChainId, verificationRpcUrl
  );

  const txResponse = await provider.sendTransaction(signedTx);
  console.log("[FourMeme] Sell tx:", txResponse.hash);
  await txResponse.wait(1);

  return { txHash: txResponse.hash, estimatedBNB };
}

// ============================================================
// Queries
// ============================================================

export interface FourMemeToken {
  name: string;
  symbol: string;
  address: string;
  volume24h?: string;
  price?: string;
  imageUrl?: string;
}

export async function getTrendingTokens(
  orderBy: string = "VOL_DAY_1",
  pageSize: number = 10
): Promise<FourMemeToken[]> {
  const res = await fetch(`${FOURMEME_API}/public/token/ranking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderBy, pageSize }),
  });

  if (!res.ok) {
    throw new Error(`Four.meme trending request failed: ${res.status}`);
  }

  const data = await res.json();
  const tokens = data.data?.list || data.data || data.list || [];

  return tokens.map((t: any) => ({
    name: t.name || t.tokenName,
    symbol: t.symbol || t.shortName,
    address: t.address || t.tokenAddress || t.contractAddress,
    volume24h: t.volume24h || t.vol,
    price: t.price,
    imageUrl: t.imageUrl || t.image,
  }));
}

export async function getTokenInfo(tokenAddress: string): Promise<{
  version: number;
  price: string;
  liquidityAdded: boolean;
  bondingCurveProgress: number;
}> {
  const provider = getBscMainnetProvider();
  const helper = new ethers.Contract(TOKEN_MANAGER_HELPER3, TokenManagerHelper3ABI, provider);

  const info = await helper.getTokenInfo(tokenAddress);

  // Bonding curve progress from token balance in contract
  const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  let bondingCurveProgress = 0;
  try {
    const balance = await token.balanceOf(TOKEN_MANAGER_V2);
    const balanceNum = parseFloat(ethers.utils.formatUnits(balance, 18));
    bondingCurveProgress = Math.max(0, Math.min(100,
      100 - (((balanceNum - 200000000) * 100) / 800000000)
    ));
  } catch (e) {
    console.warn("[FourMeme] Could not calculate bonding curve progress:", e);
  }

  return {
    version: info.version?.toNumber?.() || Number(info.version) || 2,
    price: ethers.utils.formatEther(info.price || 0),
    liquidityAdded: info.liquidityAdded || false,
    bondingCurveProgress,
  };
}

export async function getMemeTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<{ balance: string; symbol: string }> {
  const provider = getBscMainnetProvider();
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
  ];
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  const [balance, symbol, decimals] = await Promise.all([
    token.balanceOf(walletAddress),
    token.symbol(),
    token.decimals(),
  ]);

  return {
    balance: ethers.utils.formatUnits(balance, decimals),
    symbol,
  };
}
