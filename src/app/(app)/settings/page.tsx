import { Suspense } from "react";
import { fetchInstagramSettings } from "@/features/settings/services/settings-service";
import { SettingsForm } from "@/features/settings/components/settings-form";

export default async function SettingsPage() {
  const settings = await fetchInstagramSettings();
  return (
    <Suspense>
      <SettingsForm initialSettings={settings} />
    </Suspense>
  );
}
