import { fetchAIBrainSettings } from "@/features/ai-brain/services/ai-brain-service";
import { AIBrainForm } from "@/features/ai-brain/components/ai-brain-form";

export default async function AIBrainPage() {
  const settings = await fetchAIBrainSettings();

  return (
    <div className="max-w-2xl">
      <AIBrainForm initialSettings={settings} />
    </div>
  );
}
