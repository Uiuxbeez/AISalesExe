import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/features/inbox/types";

const STATUS_VARIANT = {
  open: "success",
  pending: "warning",
  closed: "neutral",
} as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ConversationListItem({
  conversation,
  isActive,
  onSelect,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-paper",
        isActive && "border-accent bg-accent-soft/60"
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/10 text-xs font-semibold text-ink">
        {getInitials(conversation.customerName)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-ink">{conversation.customerName}</span>
          <span className="shrink-0 text-xs text-muted">{conversation.lastMessageAt}</span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted">{conversation.lastMessagePreview}</span>
        <span className="mt-1.5 flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[conversation.status]} className="capitalize">
            {conversation.status}
          </Badge>
          {conversation.unreadCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
              {conversation.unreadCount}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
