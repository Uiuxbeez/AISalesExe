"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/features/inbox/components/message-bubble";
import type { Conversation, Message } from "@/features/inbox/types";

const STATUS_VARIANT = {
  open: "success",
  pending: "warning",
  closed: "neutral",
} as const;

export function ChatPanel({
  conversation,
  onMessageSent,
}: {
  conversation: Conversation;
  onMessageSent: (message: Message) => void;
}) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/inbox/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      onMessageSent(result as Message);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-ink">{conversation.customerName}</p>
          <p className="text-xs text-muted">{conversation.customerHandle}</p>
        </div>
        <Badge variant={STATUS_VARIANT[conversation.status]} className="capitalize">
          {conversation.status}
        </Badge>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <form onSubmit={handleSend} className="border-t border-line px-6 py-4">
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a reply…"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={isSending || !draft.trim()} aria-label="Send message">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </form>
    </div>
  );
}
