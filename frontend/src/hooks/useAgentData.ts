import { useQueries } from "@tanstack/react-query";
import {
  useAgentMetadata,
  fetchAgentMetadata,
  AgentData,
} from "./useAgentMetadata";

export type { AgentData };

export function useAgentData(tokenId: number | undefined): AgentData | null {
  const { data, isLoading } = useAgentMetadata(tokenId);

  if (!data && isLoading) {
    return {
      tokenId: tokenId!,
      name: `Agent #${tokenId}`,
      level: 1,
      chatCount: 0,
      creator: "",
      createdAt: 0,
      personalityHash: "",
      isLoading: true,
    };
  }

  if (!data) return null;

  return { ...data, isLoading };
}

export function useMultipleAgents(tokenIds: bigint[] | undefined) {
  const queries = useQueries({
    queries: (tokenIds || []).map((id) => ({
      queryKey: ["agent-metadata", Number(id)],
      queryFn: () => fetchAgentMetadata(Number(id)),
      staleTime: 1000 * 60 * 5, 
    })),
  });

  const agents = queries
    .map((q) => q.data)
    .filter((agent): agent is AgentData => !!agent);

  const isLoading = queries.some((q) => q.isLoading);

  const refetch = async (tokenIdToRefetch?: number) => {
    if (tokenIdToRefetch !== undefined) {
      const query = queries.find((q) => q.data?.tokenId === tokenIdToRefetch);
      if (query) {
        await query.refetch();
      }
    } else {
      await Promise.all(queries.map((q) => q.refetch()));
    }
  };

  return { agents, isLoading, refetch };
}
