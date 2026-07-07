"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ConversationListItem } from "@/features/inbox/components/conversation-list-item";
import { ChatPanel } from "@/features/inbox/components/chat-panel";
import type { Conversation, Message } from "@/features/inbox/types";

export function InboxView({ conversations: initialConversations }: { conversations: Conversation[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id);
  const [query, setQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!query.trim()) return conversations;
    const normalized = query.trim().toLowerCase();
    return conversations.filter(
      (conversation) =>
        conversation.customerName.toLowerCase().includes(normalized) ||
        conversation.customerHandle.toLowerCase().includes(normalized)
    );
  }, [conversations, query]);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  function handleMessageSent(conversationId: string, message: Message) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, message],
              lastMessagePreview: message.content,
              lastMessageAt: "now",
            }
          : conversation
      )
    );
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex w-80 shrink-0 flex-col border-r border-line">
        <div className="border-b border-line p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
              className="h-9 w-full rounded-md border border-line bg-paper pl-8 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredConversations.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">No conversations found.</p>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === selectedId}
                onSelect={() => setSelectedId(conversation.id)}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex-1">
        {selectedConversation ? (
          <ChatPanel
            key={selectedConversation.id}
            conversation={selectedConversation}
            onMessageSent={(message) => handleMessageSent(selectedConversation.id, message)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Select a conversation to view it here.
          </div>
        )}
      </div>
    </div>
  );
}
