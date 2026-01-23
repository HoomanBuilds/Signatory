<p align="center">
  <img src="frontend/public/favicon.png" width="120" alt="SIGNATORY Logo">
</p>

<h1 align="center">SIGNATORY</h1>

<p align="center">
  <strong>Agents don't act. They sign.</strong>
</p>

<p align="center">
  A protocol for autonomous AI agents with cryptographic signing authority on the blockchain.
</p>

<p align="center">
  <a href="frontend/README.md"><strong>Frontend Docs</strong></a> ·
  <a href="contract/README.md"><strong>Contract Docs</strong></a>
</p>

---

## Overview

**SIGNATORY** is a next-generation protocol that enables AI agents to autonomously execute on-chain transactions with verifiable, non-custodial security. By combining **Lit Protocol's** decentralized MPC key management with the **GOAT SDK** for DeFi operations, SIGNATORY creates a trust-minimized environment where agents can own wallets and sign transactions—only when authorized by their NFT owner.

## Core Architecture

The platform operates across three distinct layers to ensure security and autonomy:

1.  **Identity Layer (Cronos Testnet)**:
    - **AgentNFT**: Represents autonomous agent ownership and identity.
    - **AgentPKP**: Smart contract mapping AgentNFTs to distinct Programmable Key Pairs (PKPs).
    - **AgentCredits**: On-chain credit system for AI inference operational costs.

2.  **Security Layer (Lit Protocol)**:
    - **PKP Wallets**: Decentralized MPC wallets; private keys are never exposed.
    - **Lit Actions**: Immutable JavaScript logic that verifies AgentNFT ownership on-chain before authorizing any signature.

3.  **Execution Layer (Multi-Chain)**:
    - **GOAT SDK Integration**: Enables natural language translation into on-chain actions (swaps, bridges, transfers).
    - **Chain Agnostic**: Native support for Sepolia, Base, Polygon, Arbitrum, and Solana.

---

## Deployed Contracts (Cronos Testnet)

| Contract             | Address                                      |
| -------------------- | -------------------------------------------- |
| **AgentNFT**         | `0x622d4165F14F19C0467783421898279055153794` |
| **AgentMarketplace** | `0xe37c88eC02afdAe51d97422B0fAde8E9215F74ce` |
| **AgentCredits**     | `0xFF882fAB68EDF8b5eA29533FdBFCF9F48bfA38dc` |
| **RevenueShare**     | `0xF04ae4edb45313F018Ec9D70F35119fb2a54b483` |
| **AgentPKP**         | `0x0DDE835675dafB5efce044c9c69407C3cF52e2ed` |

---

## X402 Protocol Integration

SIGNATORY is built on the **X402** standard for autonomous agent monetization.

| Component            | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| **HTTP 402**         | API endpoints signal insufficient credits with status code `402`.   |
| **Paywalls**         | Frontend intercepts 402 responses and triggers seamless payment UI. |
| **AgentCredits.sol** | On-chain mechanism for purchasing inference/action credits.         |
| **Libraries**        | `x402-fetch` and `x402-next` for protocol compliance.               |

---

## Key Features

| Feature              | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| **Autonomous DeFi**  | Token swaps via Uniswap, cross-chain bridging via DeBridge.         |
| **Non-Custodial**    | Users retain full control; agents require Lit Action authorization. |
| **Natural Language** | Instruct agents in plain English via Vercel AI SDK.                 |
| **Multi-Chain**      | Unified interface across EVM networks and Solana.                   |
| **Real-Time**        | Low-latency responses and instant transaction broadcasting.         |

---

## Development Roadmap

| Phase       | Status      | Milestones                                                     |
| ----------- | ----------- | -------------------------------------------------------------- |
| **Phase 1** | Complete    | AgentPKP registry, Lit Actions, PKP minting services.          |
| **Phase 2** | Complete    | GOAT SDK integration, Uniswap V3 swaps, token management.      |
| **Phase 3** | Complete    | Cross-chain bridging (DeBridge), Solana support (Jupiter DEX). |
| **Phase 4** | In Progress | Yield farming (Aave/Ionic), prediction markets, 1inch routing. |

---

## Technology Stack

| Category      | Technologies                                       |
| ------------- | -------------------------------------------------- |
| **Frontend**  | Next.js 16, React 19, TailwindCSS v4               |
| **AI Engine** | Vercel AI SDK, OpenAI                              |
| **Protocol**  | X402 (`x402-fetch`, `x402-next`), AgentCredits.sol |
| **Security**  | Lit Protocol (MPC, Lit Actions)                    |
| **On-Chain**  | GOAT SDK                                           |
| **Web3**      | Viem, Wagmi, Ethers.js                             |
| **Database**  | ChromaDB (Vector Search)                           |

---

## Getting Started

Refer to the dedicated documentation for setup instructions:

- **Frontend**: [frontend/README.md](frontend/README.md)
- **Contracts**: [contract/README.md](contract/README.md)

---

<p align="center">
  <em>Built with precision for the autonomous future.</em>
</p>
