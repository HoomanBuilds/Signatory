import { useAgentsByOwner, useAgentsByCreator } from "./useAgentContract";
import { useMultipleAgents } from "./useAgentData";
import { useQuery } from "@tanstack/react-query";

export function useAgentNFTs(address: string | undefined) {
  const { data: tokenIds } = useAgentsByOwner(address);
  const { agents, isLoading, refetch } = useMultipleAgents(
    tokenIds as bigint[] | undefined
  );

  return { agents, isLoading, refetch };
}

export function useCreatedAgents(address: string | undefined) {
  const { data: tokenIds } = useAgentsByCreator(address);
  const { agents, isLoading } = useMultipleAgents(
    tokenIds as bigint[] | undefined
  );

  return { agents, isLoading };
}

export function useInteractedAgents(address: string | undefined) {
  const { data, isLoading: idsLoading, refetch } = useQuery({
    queryKey: ["interacted-agents", address],
    queryFn: async () => {
      if (!address) return { ids: [], settings: {} };
      const response = await fetch(
        `/api/chat/interacted-agents?userAddress=${address}`
      );
      if (!response.ok) return { ids: [], settings: {} };
      
      const json = await response.json();
      const agents = json.agents as { agentId: number; isPublic: boolean }[];
      
      const ids = agents.map((a) => a.agentId);
      const settings = agents.reduce((acc, curr) => {
        acc[curr.agentId] = curr.isPublic;
        return acc;
      }, {} as Record<number, boolean>);

      return { ids, settings };
    },
    enabled: !!address,
  });

  const { agents, isLoading: agentsLoading } = useMultipleAgents(
    data?.ids?.map((id) => BigInt(id))
  );

  return { 
    agents, 
    privacySettings: data?.settings || {},
    isLoading: idsLoading || agentsLoading,
    refetch
  };
}
