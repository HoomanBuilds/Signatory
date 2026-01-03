import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface UseChatOptions {
  agentId: number;
  tokenURI: string;
  userAddress: string;
  onCreditsSpent?: () => void;
}

/**
 * Hook for chatting with an AI agent
 */
export function useAgentChat({
  agentId,
  tokenURI,
  userAddress,
  onCreditsSpent,
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Prepare chat history (last 10 messages)
      const chatHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress,
          agentId,
          tokenURI,
          message: content,
          chatHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Notify credits spent
      if (onCreditsSpent) {
        onCreditsSpent();
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Chat error:", err);

      // Remove user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
  };
}
