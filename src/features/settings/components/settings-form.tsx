"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Instagram, Loader2, ShieldCheck, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusPulse } from "@/components/ui/status-pulse";
import type { InstagramSettings } from "@/features/settings/types";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "You declined the Instagram permissions request.",
  invalid_state: "That connection attempt expired or was tampered with. Please try again.",
  connection_failed: "Instagram didn't accept the connection. Check your app credentials and try again.",
};

export function SettingsForm({ initialSettings }: { initialSettings: InstagramSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<"idle" | "success" | "failed">("idle");
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const oauthError = searchParams.get("instagram_error");
  const oauthConnected = searchParams.get("instagram_connected");

  useEffect(() => {
    if (oauthConnected || oauthError) {
      // Clear the query params after reading them so a refresh doesn't
      // keep re-showing the banner.
      router.replace("/settings");
    }
  }, [oauthConnected, oauthError, router]);

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
    setVerifyResult("idle");

    try {
      const response = await fetch("/api/settings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const result = (await response.json()) as InstagramSettings;
      setSettings(result);
      setVerifyResult(result.isConnected ? "success" : "failed");
    } catch {
      setVerifyResult("failed");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleDisconnect() {
    setIsDisconnecting(true);

    try {
      await fetch("/api/auth/instagram/disconnect", { method: "POST" });
      router.refresh();
    } finally {
      setIsDisconnecting(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {oauthConnected && (
        <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Instagram account connected. New DMs will now land in your Inbox.
        </div>
      )}
      {oauthError && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {OAUTH_ERROR_MESSAGES[oauthError] ?? "Something went wrong connecting Instagram."}
        </div>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Instagram connection</CardTitle>
            <CardDescription>
              Connect the Instagram professional account you want to receive DMs from.
            </CardDescription>
          </div>
          {settings.isConnected ? (
            <StatusPulse status="live" label="Connected" />
          ) : (
            <StatusPulse status="idle" label="Not connected" />
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {settings.isConnected ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-muted">Connected account</span>
                <span className="font-medium text-ink">@{settings.username || "unknown"}</span>
                <span className="font-mono text-xs text-muted">{settings.businessAccountId}</span>
                {settings.lastVerifiedAt && (
                  <span className="text-xs text-muted">
                    Connected {new Date(settings.lastVerifiedAt).toLocaleString()}
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="w-fit"
              >
                {isDisconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
                {isDisconnecting ? "Disconnecting…" : "Disconnect Instagram"}
              </Button>
            </div>
          ) : (
            <a href="/api/auth/instagram/connect" className="w-fit">
              <Button type="button" className="w-fit">
                <Instagram className="h-4 w-4" />
                Connect with Instagram
              </Button>
            </a>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manual fallback</CardTitle>
            <CardDescription>
              Only needed for local testing without going through the OAuth flow above.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Instagram username</Label>
              <Input
                id="username"
                placeholder="myshop.official"
                value={settings.username}
                onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="businessAccountId">Instagram business ID</Label>
              <Input
                id="businessAccountId"
                placeholder="1784900000000123"
                className="font-mono"
                value={settings.businessAccountId}
                onChange={(e) => setSettings({ ...settings, businessAccountId: e.target.value })}
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
                onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
                autoComplete="off"
              />
              <p className="text-xs text-muted">
                Leave untouched to keep whatever token is already stored (including one from OAuth above).
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {isVerifying ? "Verifying…" : "Verify connection"}
          </Button>

          {verifyResult === "success" && (
            <span className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              Token confirmed with Instagram
            </span>
          )}
          {verifyResult === "failed" && (
            <span className="text-sm text-danger">
              Instagram rejected this token — check it&apos;s correct and try again.
            </span>
          )}

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
    </div>
  );
}
