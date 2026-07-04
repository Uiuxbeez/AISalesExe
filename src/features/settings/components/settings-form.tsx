"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusPulse } from "@/components/ui/status-pulse";
import type { InstagramSettings } from "@/features/settings/types";

export function SettingsForm({ initialSettings }: { initialSettings: InstagramSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveStatus("saving");

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Save failed");

      const saved = (await response.json()) as InstagramSettings;
      setSettings(saved);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleVerify() {
    setIsVerifying(true);

    try {
      const response = await fetch("/api/settings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const result = (await response.json()) as InstagramSettings;
      setSettings(result);
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Instagram connection</CardTitle>
            <CardDescription>Details for the Instagram Business account you want to connect.</CardDescription>
          </div>
          {settings.connectionState === "verified" && <StatusPulse status="live" label="Verified" />}
          {settings.connectionState === "failed" && <StatusPulse status="offline" label="Verification failed" />}
          {settings.connectionState === "unverified" && <StatusPulse status="idle" label="Not verified" />}
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Instagram username</Label>
            <Input
              id="username"
              placeholder="myshop.official"
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value, connectionState: "unverified" })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessAccountId">Instagram business ID</Label>
            <Input
              id="businessAccountId"
              placeholder="1784900000000123"
              className="font-mono"
              value={settings.businessAccountId}
              onChange={(e) =>
                setSettings({ ...settings, businessAccountId: e.target.value, connectionState: "unverified" })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="accessToken">Instagram access token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="IGQ••••••••••••••••••••••••"
              className="font-mono"
              value={settings.accessToken}
              onChange={(e) =>
                setSettings({ ...settings, accessToken: e.target.value, connectionState: "unverified" })
              }
              autoComplete="off"
            />
            <p className="text-xs text-muted">
              This connects your account once Instagram integration ships — nothing is sent to Meta yet.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={handleVerify} disabled={isVerifying}>
          {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {isVerifying ? "Verifying…" : "Verify connection"}
        </Button>

        <Button type="submit" disabled={saveStatus === "saving"}>
          {saveStatus === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          {saveStatus === "saving" ? "Saving…" : "Save changes"}
        </Button>

        {saveStatus === "saved" && (
          <span className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-sm text-danger">Couldn&apos;t save. Please try again.</span>
        )}
      </div>
    </form>
  );
}
