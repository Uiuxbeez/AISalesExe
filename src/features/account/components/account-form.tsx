"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { AccountInfo } from "@/features/account/types";

export function AccountForm({ initialInfo }: { initialInfo: AccountInfo }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const memberSince = new Date(initialInfo.memberSince).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setStatus("saving");

    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? "Couldn't update your password. Please try again.");
        setStatus("error");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[13px] font-medium text-muted">Name</p>
              <p className="mt-1 text-sm text-ink">{initialInfo.name || "—"}</p>
            </div>
            <div>
              <p className="text-[13px] font-medium text-muted">Business</p>
              <p className="mt-1 text-sm text-ink">{initialInfo.businessName || "—"}</p>
            </div>
          </div>
          <div>
            <p className="text-[13px] font-medium text-muted">Email</p>
            <p className="mt-1 text-sm text-ink">{initialInfo.email}</p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-muted">Member since</p>
            <p className="mt-1 text-sm text-ink">{memberSince}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Choose a new password of at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-[13px] text-danger">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={status === "saving"}>
                {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === "saving" ? "Updating…" : "Update password"}
              </Button>
              {status === "saved" && (
                <span className="flex items-center gap-1.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Password updated
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
