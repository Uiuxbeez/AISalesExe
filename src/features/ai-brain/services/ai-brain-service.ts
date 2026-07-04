import {
  getAIBrainSettings,
  saveAIBrainSettings,
} from "@/features/ai-brain/repositories/ai-brain-repository";
import type { AIBrainSettings } from "@/features/ai-brain/types";

export async function fetchAIBrainSettings(): Promise<AIBrainSettings> {
  return getAIBrainSettings();
}

export async function updateAIBrainSettings(
  settings: AIBrainSettings
): Promise<AIBrainSettings> {
  const temperature = Math.min(2, Math.max(0, settings.temperature));
  const maxTokens = Math.min(4096, Math.max(1, Math.round(settings.maxTokens)));

  return saveAIBrainSettings({ ...settings, temperature, maxTokens });
}
