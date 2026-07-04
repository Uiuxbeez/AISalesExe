import type { Conversation } from "@/features/inbox/types";

/**
 * Mock conversation data. Phase 2 replaces this with a repository that
 * reads the Conversation/Message tables via Prisma.
 */
export async function fetchConversations(): Promise<Conversation[]> {
  return [
    {
      id: "c1",
      customerName: "Jane Doe",
      customerHandle: "@jane.doe",
      lastMessagePreview: "Does this come in a size medium?",
      lastMessageAt: "2m",
      status: "open",
      unreadCount: 2,
      messages: [
        { id: "m1", sender: "customer", content: "Hi! I saw your post about the linen shirt.", timestamp: "10:02 AM" },
        { id: "m2", sender: "ai", content: "Hey Jane! Yes, the linen shirt is one of our favorites. Which color caught your eye?", timestamp: "10:03 AM" },
        { id: "m3", sender: "customer", content: "The sage green one. Does this come in a size medium?", timestamp: "10:05 AM" },
      ],
    },
    {
      id: "c2",
      customerName: "Mark Retail",
      customerHandle: "@mark.retail",
      lastMessagePreview: "Perfect, thank you for the help!",
      lastMessageAt: "3h",
      status: "closed",
      unreadCount: 0,
      messages: [
        { id: "m4", sender: "customer", content: "What's your return policy?", timestamp: "7:14 AM" },
        { id: "m5", sender: "ai", content: "We offer free returns within 30 days of delivery, no questions asked.", timestamp: "7:15 AM" },
        { id: "m6", sender: "customer", content: "Perfect, thank you for the help!", timestamp: "7:16 AM" },
      ],
    },
    {
      id: "c3",
      customerName: "Lucy Shops",
      customerHandle: "@lucy.shops",
      lastMessagePreview: "Can I get a discount code?",
      lastMessageAt: "1d",
      status: "pending",
      unreadCount: 1,
      messages: [
        { id: "m7", sender: "customer", content: "Loved the new collection! Can I get a discount code?", timestamp: "Yesterday" },
      ],
    },
    {
      id: "c4",
      customerName: "Alex Reyes",
      customerHandle: "@alex.reyes",
      lastMessagePreview: "Sounds good, I'll place the order now.",
      lastMessageAt: "2d",
      status: "closed",
      unreadCount: 0,
      messages: [
        { id: "m8", sender: "customer", content: "Is the leather bag still in stock?", timestamp: "Monday" },
        { id: "m9", sender: "ai", content: "Yes, it is! We have 4 left in stock right now.", timestamp: "Monday" },
        { id: "m10", sender: "customer", content: "Sounds good, I'll place the order now.", timestamp: "Monday" },
      ],
    },
  ];
}
