import { useQuery } from "@tanstack/react-query";

export interface AgentData {
  tokenId: number;
  name: string;
  level: number;
  chatCount: number;
  creator: string;
  createdAt: number;
  personalityHash: string;
  imageUrl?: string;
  isLoading: boolean;
}

export async function fetchAgentMetadata(tokenId: number): Promise<AgentData> {
  try {
    const response = await fetch("/api/agent-metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId }),
      cache: "no-store", 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch");
    }

    const data = await response.json();
    return {
      tokenId,
      name: data.name || `Agent #${tokenId}`,
      level: data.level || 1,
      chatCount: data.chatCount || 0,
      creator: data.creator || "",
      createdAt: data.createdAt || 0,
      personalityHash: data.personalityHash || "",
      imageUrl: data.imageUrl,
      isLoading: false,
    };
  } catch (error) {
    console.error(`Error fetching agent ${tokenId}:`, error);
    return {
      tokenId,
      name: `Agent #${tokenId}`,
      level: 1,
      chatCount: 0,
      creator: "",
      createdAt: 0,
      personalityHash: "",
      isLoading: false,
    };
  }
}

export function useAgentMetadata(tokenId: number | undefined) {
  return useQuery({
    queryKey: ["agent-metadata", tokenId],
    queryFn: () => fetchAgentMetadata(tokenId!),
    enabled: tokenId !== undefined,
    staleTime: 1000 * 60 * 5, 
  });
}
