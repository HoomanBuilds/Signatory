"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Layout from "@/components/Layout";
import { useAgentNFTs, useInteractedAgents } from "@/hooks/useAgentNFTs";
import { useChat } from "@/hooks/useChat";
import AgentIconBar from "@/components/chat/AgentIconBar";
import AgentInfoPanel from "@/components/chat/AgentInfoPanel";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatHistorySlider from "@/components/chat/ChatHistorySlider";
import EmptyState from "@/components/EmptyState";
import { Menu, Loader2, Lock } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useAgentPersonality } from "@/hooks/useAgentPersonality";
import PaymentModal from "@/components/chat/PaymentModal";
import FloatingCredits from "@/components/chat/FloatingCredits";

import { useMultipleAgents } from "@/hooks/useAgentData";

export default function ChatSessionPage() {
  const router = useRouter();
  const params = useParams();
  const { address } = useAccount();
  const { agents: myAgents, isLoading: myAgentsLoading, refetch } = useAgentNFTs(address);
  const { agents: interactedAgents, isLoading: interactedLoading, privacySettings, refetch: refetchInteractedAgents } = useInteractedAgents(address);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  // Use state to manage current agent/session for instant switching
  const [activeAgentId, setActiveAgentId] = useState<number | null>(
    params.agentId ? parseInt(params.agentId as string) : null
  );
  const [activeSessionId, setActiveSessionId] = useState<string>(
    params.sessionId as string
  );

  const agentId = activeAgentId;
  const sessionId = activeSessionId;

  // Fetch specific agent if not in lists (for public agents I don't own/haven't chatted with)
  const { agents: specificAgents } = useMultipleAgents(
    agentId ? [BigInt(agentId)] : undefined
  );

  // Find agent data from lists or specific fetch
  const selectedAgentData = 
    myAgents.find((agent) => agent.tokenId === agentId) || 
    interactedAgents.find((agent) => agent.tokenId === agentId) ||
    specificAgents.find((agent) => agent.tokenId === agentId);

  const { data: personality } = useAgentPersonality(
    selectedAgentData?.personalityHash
  );

  // Check privacy when agent is selected
  useEffect(() => {
    async function checkPrivacy() {
      if (!agentId) return;
      
      // If I own it, it's never private to me
      const isOwned = myAgents.some(a => a.tokenId === agentId);
      if (isOwned) {
        setIsPrivate(false);
        return;
      }

      // Check optimization first
      if (privacySettings && privacySettings[agentId] !== undefined) {
        setIsPrivate(!privacySettings[agentId]);
        return;
      }

      // Fallback fetch (should rarely happen)
      try {
        const response = await fetch(`/api/agent/settings?agentId=${agentId}`);
        if (response.ok) {
          const settings = await response.json();
          setIsPrivate(!settings.isPublic);
        }
      } catch (e) {
        console.error("Error checking privacy:", e);
      }
    }
    checkPrivacy();
  }, [agentId, myAgents, privacySettings]);

  const {
    messages,
    sessions,
    currentSessionId,
    input,
    setInput,
    isSending,
    isLoadingHistory,
    sendMessage,
    selectSession,
    createNewSession,
    deleteSession,
    paymentRequirement,
    isPaying,
    confirmPayment,
    clearPaymentRequirement,
    pendingSwap,
    isSwapping,
    confirmSwap,
    cancelSwap,
    pendingBridge,
    isBridging,
    confirmBridge,
    cancelBridge,
  } = useChat(
    agentId,
    selectedAgentData?.name,
    sessionId,
    selectedAgentData?.personalityHash,
    personality,
    () => {
      setTimeout(() => {
        if (agentId) refetch(agentId);
        refetchInteractedAgents();
      }, 2000);
    }
  );

  const handleSelectAgent = (tokenId: number) => {
    const newSessionId = uuidv4();
    setActiveAgentId(tokenId);
    setActiveSessionId(newSessionId);
    window.history.pushState(null, "", `/chat/${tokenId}/${newSessionId}`);
  };

  const handleSelectSession = (newSessionId: string) => {
    if (agentId) {
      setActiveSessionId(newSessionId);
      window.history.pushState(null, "", `/chat/${agentId}/${newSessionId}`);
      selectSession(newSessionId);
      setIsHistoryOpen(false);
    }
  };

  const handleNewChat = () => {
    if (agentId) {
      const newSessionId = uuidv4();
      setActiveSessionId(newSessionId);
      createNewSession(newSessionId);
      window.history.pushState(null, "", `/chat/${agentId}/${newSessionId}`);
      setIsHistoryOpen(false);
    }
  };

  const handleDeleteSession = async (sessionIdToDelete: string) => {
    await deleteSession(sessionIdToDelete);
    if (sessionIdToDelete === sessionId && agentId) {
      const newSessionId = uuidv4();
      setActiveSessionId(newSessionId);
      window.history.pushState(null, "", `/chat/${agentId}/${newSessionId}`);
    }
  };

  const handleClearMemory = async () => {
    if (!address || !agentId || !currentSessionId) return;

    if (!confirm("Are you sure you want to clear this chat session?")) {
      return;
    }

    setIsClearing(true);
    try {
      await deleteSession(currentSessionId);
      const newSessionId = uuidv4();
      router.push(`/chat/${agentId}/${newSessionId}`);
    } catch (error) {
      console.error("Error clearing session:", error);
      alert("Failed to clear chat session");
    } finally {
      setIsClearing(false);
    }
  };

  if (!address) {
    return (
      <Layout>
        <EmptyState
          icon=""
          title="Connect Your Wallet"
          description="Please connect your wallet to chat with your AI agents"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-80px)]">
        <AgentIconBar
          myAgents={myAgents}
          interactedAgents={interactedAgents}
          privacySettings={privacySettings}
          isLoading={myAgentsLoading || interactedLoading}
          selectedAgentId={agentId}
          onSelectAgent={handleSelectAgent}
        />

        {agentId && selectedAgentData ? (
          <>
            <AgentInfoPanel
              agent={selectedAgentData}
              personality={personality}
              onClearSession={handleClearMemory}
              isClearing={isClearing}
            />

            <div className="flex-1 flex flex-col relative">
              {/* Floating Hamburger Button */}
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="absolute top-4 left-4 z-10 p-3 glass-panel border border-emerald-500/30 rounded-xl hover:bg-emerald-500/10 transition-all shadow-lg"
                title="View chat sessions"
              >
                <Menu className="w-6 h-6 text-emerald-300" />
              </button>

              {/* Floating Credits Display */}
              <FloatingCredits 
                agentId={agentId} 
                isOwner={myAgents.some(a => a.tokenId === agentId)}
                messageCount={messages.length}
              />

              {isLoadingHistory ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-emerald-300 animate-spin" />
                </div>
              ) : (
                <ChatMessages
                  messages={messages}
                  agentName={selectedAgentData.name}
                  isThinking={isSending}
                  pendingSwap={pendingSwap}
                  isSwapping={isSwapping}
                  onConfirmSwap={confirmSwap}
                  onCancelSwap={cancelSwap}
                  pendingBridge={pendingBridge}
                  isBridging={isBridging}
                  onConfirmBridge={confirmBridge}
                  onCancelBridge={cancelBridge}
                />
              )}

              <ChatInput
                value={input}
                onChange={setInput}
                onSend={sendMessage}
                isSending={isSending}
                agentName={selectedAgentData.name}
                isReadOnly={isPrivate}
              />

              <ChatHistorySlider
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
                onDeleteSession={handleDeleteSession}
              />

              {/* Payment Modal */}
              <PaymentModal
                isOpen={!!paymentRequirement}
                onClose={clearPaymentRequirement}
                onConfirm={confirmPayment}
                isProcessing={isPaying}
                cost={paymentRequirement?.amount || paymentRequirement?.value || "0.0001"}
                currency={paymentRequirement?.currency || "ETH"}
                description={paymentRequirement?.description}
                type={["recordRevenue", "purchaseSession"].includes(paymentRequirement?.functionName || "") ? "revenue-share" : "credit-purchase"}
              />
            </div>
          </>
        ) : (
          <div className="flex-1">
            <EmptyState
              icon=""
              title="Select an agent"
              description="Choose an agent from the left to start chatting"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
