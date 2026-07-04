import { fetchConversations } from "@/features/inbox/services/inbox-service";
import { InboxView } from "@/features/inbox/components/inbox-view";

export default async function InboxPage() {
  const conversations = await fetchConversations();
  return <InboxView conversations={conversations} />;
}
