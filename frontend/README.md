# SIGNATORY Frontend

The official frontend for the SIGNATORY ecosystem, a platform for AI-driven NFT agents. Built with Next.js, TailwindCSS, and integrated with the XRP Ledger and Cronos networks.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **Wallet Connection**: [RainbowKit](https://www.rainbowkit.com/) & [Wagmi](https://wagmi.sh/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/docs), [OpenAI](https://openai.com/), [GOAT SDK](https://github.com/goat-sdk/goat)
- **State Management**: React Query
- **Icons**: Lucide React

## Features

- **Agent Minting**: Create unique AI agents as NFTs.
- **Marketplace**: Buy and sell AI agents.
- **Chat Interface**: Interact with AI agents, perform on-chain actions (Bridge, Swap).
- **Profile**: Manage your agents and credits.
- **Responsive Design**: High-contrast, premium aesthetic optimized for all devices.

## Directoy Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components.
- `src/constants`: Configuration and contract addresses.
- `src/hooks`: Custom React hooks.
- `src/lib`: Utility functions, API clients, and blockchain logic.
- `src/types`: TypeScript type definitions.

## Prerequisites

- Node.js (v18+)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory and add the following variables (see `.env.local.example` for reference):

```env
# App
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...

# AI
OPENAI_API_KEY=...

# Blockchain
NEXT_PUBLIC_ALCHEMY_API_KEY=...
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.
