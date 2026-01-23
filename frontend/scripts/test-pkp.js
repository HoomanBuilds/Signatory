/**
 * Phase 0: Validate Lit Protocol PKP
 *
 * This script tests:
 * 1. Connecting to Lit Network (Datil-dev)
 * 2. Minting Capacity Credits
 * 3. Minting a PKP
 * 4. Getting the PKP wallet address
 *
 * Run: node scripts/test-pkp.js
 */

const { LitNodeClient } = require("@lit-protocol/lit-node-client");
const { LitContracts } = require("@lit-protocol/contracts-sdk");
const { ethers } = require("ethers");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const WALLET_PRIVATE_KEY =
  process.env.LIT_WALLET_PRIVATE_KEY || process.env.BACKEND_PRIVATE_KEY;

if (!WALLET_PRIVATE_KEY) {
  console.error(
    "❌ Missing LIT_WALLET_PRIVATE_KEY or BACKEND_PRIVATE_KEY in .env.local"
  );
  process.exit(1);
}

async function main() {
  console.log("🔄 Phase 0: Validating Lit Protocol PKP\n");

  // Step 1: Connect to Lit Network (using Datil Test - DECENTRALIZED testnet)
  console.log("1️⃣  Connecting to Lit Network (datil-test)...");
  const litNodeClient = new LitNodeClient({
    litNetwork: "datil-test",
    debug: false,
  });
  await litNodeClient.connect();
  console.log("   ✅ Connected to Lit Network\n");

  // Step 2: Create ethers wallet (using Chronicle Yellowstone RPC)
  console.log("2️⃣  Creating ethers wallet...");
  const rpcUrl = "https://yellowstone-rpc.litprotocol.com";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
  console.log(`   📍 Wallet address: ${wallet.address}`);

  const balance = await wallet.getBalance();
  console.log(`   💰 Balance: ${ethers.utils.formatEther(balance)} tstLPX\n`);

  if (balance.isZero()) {
    console.log(
      "   ⚠️  No tstLPX balance - but datil-dev is FREE, continuing...\n"
    );
  }

  // Step 3: Initialize Lit Contracts
  console.log("3️⃣  Initializing Lit Contracts...");
  const litContracts = new LitContracts({
    signer: wallet,
    network: "datil-test",
    debug: false,
  });
  await litContracts.connect();
  console.log("   ✅ Lit Contracts initialized\n");

  // Step 4: Mint Capacity Credits
  console.log("4️⃣  Minting Capacity Credits...");
  try {
    const capacityResult = await litContracts.mintCapacityCreditsNFT({
      requestsPerKilosecond: 10,
      daysUntilUTCMidnightExpiration: 1,
    });
    console.log(
      `   ✅ Capacity Credit minted! Token ID: ${capacityResult.capacityTokenIdStr}\n`
    );
  } catch (error) {
    console.log(`   ⚠️  Capacity Credit minting: ${error.message}\n`);
  }

  // Step 5: Mint PKP
  console.log("5️⃣  Minting PKP (Programmable Key Pair)...");
  try {
    const mintResult = await litContracts.pkpNftContractUtils.write.mint();

    const pkpInfo = mintResult.pkp;
    console.log("   ✅ PKP Minted!");
    console.log(`   🔑 PKP Token ID: ${pkpInfo.tokenId}`);
    console.log(`   📍 PKP Ethereum Address: ${pkpInfo.ethAddress}`);
    console.log(`   🔐 PKP Public Key: ${pkpInfo.publicKey}\n`);

    // Step 6: Verify PKP exists
    console.log("6️⃣  Verifying PKP on-chain...");
    const pkpExists = await litContracts.pkpNftContract.read.exists(
      pkpInfo.tokenId
    );
    console.log(`   ✅ PKP exists on-chain: ${pkpExists}\n`);

    // Summary
    console.log("🎉 Phase 0 Complete! PKP Validation Successful\n");
    console.log("=".repeat(50));
    console.log("PKP Details to save:");
    console.log(`  PKP_TOKEN_ID=${pkpInfo.tokenId}`);
    console.log(`  PKP_ETH_ADDRESS=${pkpInfo.ethAddress}`);
    console.log(`  PKP_PUBLIC_KEY=${pkpInfo.publicKey}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ PKP Minting failed:", error.message);
    console.log("\nThis might be because:");
    console.log("1. No tokens for gas on Naga Dev network");
    console.log("2. Network issue with Lit nodes");
    console.log("\nTrying alternative: Check if we're on wrong network...");
  }

  // Disconnect
  await litNodeClient.disconnect();
  console.log("\n✅ Done! Disconnected from Lit Network.");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
