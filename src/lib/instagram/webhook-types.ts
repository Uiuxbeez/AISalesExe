/** Shape of the messaging webhook Meta sends for the "instagram" object, "messages" field. */
export type InstagramWebhookPayload = {
  object: string;
  entry: Array<{
    id: string; // the receiving IG professional account's id
    time: number;
    messaging?: Array<{
      sender: { id: string }; // IGSID of the customer
      recipient: { id: string }; // the IG professional account's id
      timestamp: number;
      message?: {
        mid: string;
        text?: string;
        is_echo?: boolean; // true for messages the business itself sent
        attachments?: Array<{ type: string; payload?: { url?: string } }>;
      };
    }>;
  }>;
};

export type ParsedIncomingMessage = {
  igBusinessAccountId: string;
  senderIgsid: string;
  content: string;
  createdAt: Date;
};

/**
 * Flattens a webhook payload into individual inbound customer messages,
 * skipping echoes (messages the business itself sent, which Meta also
 * delivers here) since Phase 2 only cares about DMs landing from customers.
 */
export function parseIncomingMessages(payload: InstagramWebhookPayload): ParsedIncomingMessage[] {
  const results: ParsedIncomingMessage[] = [];

  for (const entry of payload.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      if (!event.message || event.message.is_echo) continue;

      const content =
        event.message.text ??
        (event.message.attachments?.length ? `[${event.message.attachments[0].type} attachment]` : "");

      if (!content) continue;

      results.push({
        igBusinessAccountId: entry.id,
        senderIgsid: event.sender.id,
        content,
        createdAt: new Date(event.timestamp),
      });
    }
  }

  return results;
}
