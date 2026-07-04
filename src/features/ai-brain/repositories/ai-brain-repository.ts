import type { AIBrainSettings } from "@/features/ai-brain/types";

/**
 * In-memory placeholder for the AISettings table. The schema already
 * exists in Prisma; wiring this repository to real queries — and
 * actually calling OpenAI — is scoped to a later phase.
 */
let currentSettings: AIBrainSettings = {
  openAiApiKey: "",
  temperature: 0.7,
  maxTokens: 512,
  systemPrompt:
    "You are a friendly, knowledgeable sales executive for our Instagram shop. Keep replies short, warm, and helpful.",
};

export async function getAIBrainSettings(): Promise<AIBrainSettings> {
  return currentSettings;
}

export async function saveAIBrainSettings(
  settings: AIBrainSettings
): Promise<AIBrainSettings> {
  currentSettings = settings;
  return currentSettings;
}
