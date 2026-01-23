# AI NFT Agent Platform

A next-generation autonomous agent interface enabling AI-driven blockchain interactions through secure, non-custodial key management.

## Overview

The AI NFT Agent Platform integrates **Lit Protocol** for decentralized Multi-Party Computation (MPC) key management and **GOAT SDK** for on-chain DeFi operations. This architecture allows AI agents to securely own wallets and autonomously execute transactions across multiple blockchains (EVM, Solana, and more) while maintaining strict ownership verification.

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

## X402 Protocol Integration

This project is built on the **X402** standard for autonomous agent monetization.

- **HTTP 402 Payment Required**: API endpoints utilize status code `402` to signal insufficient credits.
- **Seamless Paywalls**: The frontend (`useChat.ts`) intercepts 402 responses and triggers the payment UI without disrupting the user flow.
- **AgentCredits**: Powered by `AgentCredits.sol` on Cronos, enabling a standardized, on-chain mechanism for purchasing inference/action credits.
- **Libraries**: Leverages `x402-fetch` and `x402-next` for standardized protocol compliance.

## Key Features

- **Autonomous DeFi Operations**: seamless token swaps via Uniswap, cross-chain bridging via DeBridge, and asset management.
- **Non-Custodial Security**: Users retain full control via their AgentNFT; the backend cannot sign transactions without Lit Action authorization.
- **Natural Language Interface**: Powered by Vercel AI SDK, allowing users to instruct agents in plain English (e.g., "Swap 0.5 ETH for USDC on Sepolia").
- **Multi-Chain Support**: Unified interface for managing assets across disparate blockchain networks.
- **Real-Time Interactions**: Low-latency responses and transaction broadcasting.

## Current Status

The project has successfully completed **Phase 3** of the development roadmap.

### ✅ Phase 1: Smart Contract & Identity Integration

- Deployed `AgentPKP.sol` registry on Cronos Testnet.
- Implemented Lit Actions for cryptographically secure ownership verification.
- Established backend PKP minting and registration services.

### ✅ Phase 2: DeFi Capabilities

- Integrated GOAT SDK with Lit Protocol wallets.
- Implemented Uniswap V3 swapping functionality on Sepolia.
- Developed comprehensive balance fetching and token management.

### ✅ Phase 3: Multi-Chain Operations

- Added support for cross-chain bridging (DeBridge).
- Integrated Solana network support (Jupiter DEX).
- Unified multi-chain address derivation from single PKP.

## Upcoming Roadmap

### 🚧 Phase 4: Advanced DeFi

- **Yield & Lending**: Integration with Ionic and Aave plugins for autonomous yield farming.
- **Prediction Markets**: Support for Polymarket betting via agent intelligence.
- **DEX Optimization**: 1inch plugin for optimal swap routing.
- **Hardened Security**: Implementing spending limits and allowances via Lit Actions.
- **Portfolio Analytics**: Comprehensive dashboard for tracking multi-chain asset performance.

## Technology Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS v4
- **AI Engine**: Vercel AI SDK, OpenAI
- **X402 Protocol**: `x402-fetch`, `x402-next`, AgentCredits.sol
- **Blockchain Security**: Lit Protocol (MPC, Lit Actions)
- **On-Chain Actions**: GOAT SDK (Great On-Chain Agent Toolkit)
- **Web3 Libraries**: Viem, Wagmi, Ethers.js
- **Database**: ChromaDB (Vector Search)

## Getting Started

1.  **Installation**:

    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Configure `.env.local` with required keys for Lit Protocol, OpenAI, and RPC endpoints.

3.  **Development Server**:
    ```bash
    npm run dev
    ```

---

_Built with precision for the autonomous future._
