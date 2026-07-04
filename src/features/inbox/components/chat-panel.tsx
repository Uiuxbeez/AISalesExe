import { Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/features/inbox/components/message-bubble";
import type { Conversation } from "@/features/inbox/types";

const STATUS_VARIANT = {
  open: "success",
  pending: "warning",
  closed: "neutral",
} as const;

export function ChatPanel({ conversation }: { conversation: Conversation }) {
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

      <div className="border-t border-line px-6 py-4">
        <div className="flex items-center gap-2">
          <Input placeholder="Messaging isn't connected yet" disabled />
          <Button size="icon" disabled aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Sending replies will be available once Instagram messaging is connected.
        </p>
      </div>
    </div>
  );
}
