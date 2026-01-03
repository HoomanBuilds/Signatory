import { useQuery } from "@tanstack/react-query";

interface PersonalityData {
  tone: string;
  style: string;
  role: string;
  knowledge_focus: string[];
  response_pattern: string;
  likes: string[];
  dislikes: string[];
  backstory: string;
  example_phrases: string[];
  knowledgeBaseId?: string;
}

async function fetchPersonality(tokenURI: string): Promise<PersonalityData> {
  const ipfsUrl = tokenURI.startsWith("ipfs://")
    ? tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
    : `https://ipfs.io/ipfs/${tokenURI}`;

  const response = await fetch(ipfsUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch personality");
  }

  const data = await response.json();
  return data.personality || data;
}

export function useAgentPersonality(tokenURI: string | undefined) {
  return useQuery({
    queryKey: ["agent-personality", tokenURI],
    queryFn: () => fetchPersonality(tokenURI!),
    enabled: !!tokenURI,
    staleTime: Infinity, 
    gcTime: 1000 * 60 * 60 * 24, 
  });
}
