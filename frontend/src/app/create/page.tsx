"use client";

import Layout from "@/components/Layout";
import MintAgentForm from "@/components/create_nft/MintAgentForm";

export default function CreatePage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-200 mb-4">
            Create Your AI Agent
          </h1>
          <p className="text-xl text-green-200/70">
            Mint a unique AI agent NFT with custom personality traits
          </p>
        </div>

        <MintAgentForm />
      </div>
    </Layout>
  );
}
