import { openai } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";

/**
 * Build personality-injected system prompt from agent metadata
 */
export function buildPersonalityPrompt(personality: any): string {
  const { tone, style, role, knowledge_focus, likes, dislikes, backstory } =
    personality;

  return `You are an AI agent with the following personality traits:

ROLE: ${role || "AI Assistant"}
TONE: ${tone || "friendly"}
STYLE: ${style || "conversational"}
KNOWLEDGE FOCUS: ${knowledge_focus?.join(", ") || "general"}

LIKES: ${likes?.join(", ") || "helping users"}
DISLIKES: ${dislikes?.join(", ") || "being unhelpful"}

${backstory ? `BACKSTORY: ${backstory}` : ""}

You MUST respond in this character consistently. Stay true to your personality in every response.
If you are provided with "Context from Knowledge Base", use that information to answer the user's questions.
Always follow safety, ethical, and legal guidelines. Avoid harmful advice or explicit content.`;
}

/**
 * Generate AI response with personality injection
 */
export async function generateAgentResponse(
  personality: any,
  userMessage: string,
  chatHistory: Array<{ role: "user" | "assistant"; content: string }> = []
) {
  const systemPrompt = buildPersonalityPrompt(personality);

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: [
      ...chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user" as const, content: userMessage },
    ],
    temperature: personality.model?.temperature || 0.8,
  });

  return text;
}

/**
 * Generate AI response with streaming
 */
export async function streamAgentResponse(
  personality: any,
  userMessage: string,
  chatHistory: Array<{ role: "user" | "assistant"; content: string }> = []
) {
  const systemPrompt = buildPersonalityPrompt(personality);

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: [
      ...chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user" as const, content: userMessage },
    ],
    temperature: personality.model?.temperature || 0.8,
  });

  return result.toTextStreamResponse();
}

/**
 * Generate preview responses for agent minting
 */
export async function generateAgentPreview(
  personality: any,
  samplePrompts: string[] = [
    "Hello! Tell me about yourself.",
    "What are you passionate about?",
    "How would you help me?",
  ]
): Promise<string[]> {
  const responses: string[] = [];

  for (const prompt of samplePrompts) {
    const response = await generateAgentResponse(personality, prompt);
    responses.push(response);
  }

  return responses;
}
