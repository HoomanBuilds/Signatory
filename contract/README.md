# SIGNATORY Ecosystem Smart Contracts

This directory contains the smart contracts for the SIGNATORY ecosystem, built with Solidity and Hardhat.

## Overview

The ecosystem consists of several core contracts:

- **AgentNFT**: ERC721 token representing AI agents.
- **AgentMarketplace**: Marketplace for trading Agent NFTs.
- **AgentCredits**: System for managing credits used to interact with agents.
- **RevenueShare**: Logic for distributing revenue among stakeholders.
- **AgentPKP**: Integration with Lit Protocol (PKP) for agent capabilities.

## Directory Structure

- `contracts/`: Solidity source code.
- `deploy/`: Hardhat deployment scripts.
- `scripts/`: Utility scripts.
- `test/`: Automated test suite.
- `hardhat.config.js`: Hardhat configuration.

## Prerequisites

- Node.js (v18+)
- npm or yarn

## Installation

```bash
npm install
```

## Usage

### Compile

Compile the smart contracts:

```bash
npx hardhat compile
```

### Test

Run the test suite:

```bash
npx hardhat test
```

### Deploy

Deploy to a network (e.g., Cronos Testnet):

```bash
npx hardhat deploy --network cronosTestnet
```

For local deployment:

```bash
npx hardhat deploy --network localhost
```

## Deployment Addresses

### Cronos Testnet (Chain ID: 338)

| Contract             | Address                                      |
| -------------------- | -------------------------------------------- |
| **AgentNFT**         | `0x622d4165F14F19C0467783421898279055153794` |
| **AgentMarketplace** | `0xe37c88eC02afdAe51d97422B0fAde8E9215F74ce` |
| **AgentCredits**     | `0xFF882fAB68EDF8b5eA29533FdBFCF9F48bfA38dc` |
| **RevenueShare**     | `0xF04ae4edb45313F018Ec9D70F35119fb2a54b483` |
| **AgentPKP**         | `0x0DDE835675dafB5efce044c9c69407C3cF52e2ed` |

### Sepolia Testnet (Chain ID: 11155111)

| Contract             | Address                                      |
| -------------------- | -------------------------------------------- |
| **AgentNFT**         | `0x9D1e8dFA58E630Bd0864E250156543B60c41A477` |
| **AgentMarketplace** | `0x0461D3AFec6454C4d52CF63987Ef536bAED6EeE3` |
| **AgentCredits**     | `0x60cC7B05eA05d8D3acA190AcC064D7798f6e0aFA` |
| **RevenueShare**     | `0x3192a5fE7601b5a06edBD5D31Dc3CC8bE7Ba0Bc9` |

### Hardhat Local (Chain ID: 31337)

| Contract             | Address                                      |
| -------------------- | -------------------------------------------- |
| **AgentNFT**         | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| **AgentMarketplace** | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| **AgentCredits**     | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |
| **RevenueShare**     | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |

## Environment Variables

Create a `.env` file based on `.env.example` and populate it with your keys:

```env
SEPOLIA_RPC_URL=...
CRONOS_TESTNET_RPC_URL=...
SEPOLIA_PRIVATE_KEY=...
CRONOS_PRIVATE_KEY=...
ETHERSCAN_API_KEY=...
CRONOSCAN_API_KEY=...
```
