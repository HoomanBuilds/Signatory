import { uploadJSONToPinata, uploadFileToPinata, getIPFSUri } from "./pinata";

export interface PersonalityTraits {
  tone: string;
  style: string;
  role: string;
  knowledge_focus: string[];
  response_pattern: string;
  likes: string[];
  dislikes: string[];
  backstory: string;
  example_phrases: string[];
}

export interface ModelConfig {
  base_model: string;
  temperature: number;
  max_tokens: number;
  stop_sequences: string[];
}

export interface AgentMetadata {
  name: string;
  description: string;
  image: string; // IPFS URL
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  personality: PersonalityTraits;
  model: ModelConfig;
  knowledgeBaseId?: string; 
  version: string;
  created: string;
}

/**
 * Upload agent avatar image to IPFS
 */
export async function uploadAgentAvatar(file: File): Promise<string> {
  console.log("Uploading avatar to IPFS...");
  const hash = await uploadFileToPinata(file);
  console.log("Avatar uploaded:", hash);
  return hash;
}

/**
 * Create and upload agent metadata to IPFS
 */
export async function createAgentMetadata(
  name: string,
  description: string,
  avatarHash: string,
  personality: PersonalityTraits,
  knowledgeBaseId?: string,
  modelConfig?: Partial<ModelConfig>
): Promise<{ metadataHash: string; metadataUri: string }> {
  const attributes = [
    { trait_type: "Tone", value: personality.tone },
    { trait_type: "Style", value: personality.style },
    { trait_type: "Role", value: personality.role },
    { trait_type: "Response Pattern", value: personality.response_pattern },
  ];

  if (knowledgeBaseId) {
    attributes.push({ trait_type: "Knowledge Base", value: "Enabled" });
  }

  const metadata: AgentMetadata = {
    name,
    description,
    image: `ipfs://${avatarHash}`,
    attributes,
    personality,
    model: {
      base_model: modelConfig?.base_model || "gpt-4",
      temperature: modelConfig?.temperature || 0.8,
      max_tokens: modelConfig?.max_tokens || 150,
      stop_sequences: modelConfig?.stop_sequences || [],
    },
    knowledgeBaseId,
    version: "1.0",
    created: new Date().toISOString(),
  };

  console.log("Uploading metadata to IPFS...");
  const metadataHash = await uploadJSONToPinata(metadata, `${name}-metadata`);
  console.log("Metadata uploaded:", metadataHash);

  return {
    metadataHash,
    metadataUri: getIPFSUri(metadataHash),
  };
}

/**
 * Fetch agent metadata from IPFS
 */
export async function fetchAgentMetadata(
  ipfsUri: string
): Promise<AgentMetadata> {
  const hash = ipfsUri.replace("ipfs://", "");
  const gateway =
    process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud";
  const url = `${gateway}/ipfs/${hash}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.statusText}`);
  }

  return response.json();
}
