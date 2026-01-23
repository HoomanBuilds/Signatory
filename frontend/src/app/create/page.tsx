"use client";

import Layout from "@/components/Layout";
import MintAgentForm from "@/components/create_nft/MintAgentForm";

export default function CreatePage() {
  return (
    <Layout>
      <div className="min-h-screen bg-black text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">
              Create Agent
            </h1>
            <p className="text-xl text-[#666] font-mono max-w-2xl mx-auto">
              Mint a unique AI entity with custom personality traits and knowledge.
            </p>
          </div>

          <MintAgentForm />
        </div>
      </div>
    </Layout>
  );
}
