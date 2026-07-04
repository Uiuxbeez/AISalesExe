export type MessageSender = "customer" | "ai" | "agent";

export type Message = {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
};

export type ConversationStatus = "open" | "pending" | "closed";

export type Conversation = {
  id: string;
  customerName: string;
  customerHandle: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  status: ConversationStatus;
  unreadCount: number;
  messages: Message[];
};
