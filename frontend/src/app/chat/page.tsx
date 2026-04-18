"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Layout from "@/components/Layout";
import { useAgentNFTs } from "@/hooks/useAgentNFTs";
import EmptyState from "@/components/EmptyState";
import { Loader2 } from "lucide-react";

export default function ChatRedirectPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { agents, isLoading } = useAgentNFTs(address);

  useEffect(() => {
    // Redirect to first agent if available
    if (!isLoading && agents.length > 0 && address) {
      const firstAgent = agents[0];
      const newSessionId = `session_${Date.now()}`;
      router.replace(`/chat/${firstAgent.tokenId}/${newSessionId}`);
    }
  }, [agents, isLoading, address, router]);

  if (!address) {
    return (
      <Layout>
        <EmptyState
          icon="🔐"
          title="Connect Your Wallet"
          description="Please connect your wallet to chat with your AI agents"
        />
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-signal animate-spin" />
        </div>
      </Layout>
    );
  }

  if (agents.length === 0) {
    return (
      <Layout>
        <EmptyState
          icon="🤖"
          title="No Agents Found"
          description="You don't own any agents yet. Mint one to start chatting!"
        />
      </Layout>
    );
  }

  // Show loading while redirecting
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-signal animate-spin" />
      </div>
    </Layout>
  );
}
