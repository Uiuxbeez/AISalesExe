"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AIBrainSettings } from "@/features/ai-brain/types";

export function AIBrainForm({ initialSettings }: { initialSettings: AIBrainSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    try {
      const response = await fetch("/api/ai-brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Save failed");

      const saved = (await response.json()) as AIBrainSettings;
      setSettings(saved);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Model access</CardTitle>
          <CardDescription>Your OpenAI API key, stored securely and used only by your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <Label htmlFor="openAiApiKey">OpenAI API key</Label>
          <Input
            id="openAiApiKey"
            type="password"
            placeholder="sk-••••••••••••••••••••••••"
            className="font-mono"
            value={settings.openAiApiKey}
            onChange={(e) => setSettings({ ...settings, openAiApiKey: e.target.value })}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-muted">
            This key isn&apos;t used yet — AI replies aren&apos;t connected in this phase.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response behavior</CardTitle>
          <CardDescription>Control how creative and how long your AI&apos;s replies are.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature</Label>
              <span className="font-mono text-xs text-muted">{settings.temperature.toFixed(1)}</span>
            </div>
            <input
              id="temperature"
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line accent-accent"
            />
            <div className="flex justify-between text-[11px] text-muted">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maxTokens">Max tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              min={1}
              max={4096}
              value={settings.maxTokens}
              onChange={(e) => setSettings({ ...settings, maxTokens: Number(e.target.value) })}
              className="max-w-[160px]"
            />
            <p className="text-xs text-muted">The upper limit on how long a single reply can be.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System prompt</CardTitle>
          <CardDescription>The instructions your AI sales executive follows in every conversation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.systemPrompt}
            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
            rows={6}
            placeholder="You are a friendly, knowledgeable sales executive for our Instagram shop…"
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={status === "saving"}>
          {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "saving" ? "Saving…" : "Save changes"}
        </Button>
        {status === "saved" && (
          <span className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-danger">Couldn&apos;t save. Please try again.</span>
        )}
      </div>
    </form>
  );
}
