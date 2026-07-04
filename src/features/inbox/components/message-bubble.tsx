import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import type { Message } from "@/features/inbox/types";

export function MessageBubble({ message }: { message: Message }) {
  const isCustomer = message.sender === "customer";

  return (
    <div className={cn("flex items-end gap-2", !isCustomer && "flex-row-reverse")}>
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          isCustomer ? "bg-ink/10 text-ink" : "bg-accent-soft text-accent"
        )}
      >
        {isCustomer ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </span>

      <div className={cn("flex max-w-[70%] flex-col gap-1", !isCustomer && "items-end")}>
        <div
          className={cn(
            "rounded-lg px-3.5 py-2 text-sm",
            isCustomer ? "bg-paper text-ink" : "bg-accent text-accent-foreground"
          )}
        >
          {message.content}
        </div>
        <span className="text-[11px] text-muted">{message.timestamp}</span>
      </div>
    </div>
  );
}
