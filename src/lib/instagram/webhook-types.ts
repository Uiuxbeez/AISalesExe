/**
 * Shape of the messaging webhook Meta sends for the "instagram" object,
 * "messages" field.
 *
 * Meta has been observed delivering this in two different shapes for the
 * same field: the Messenger-Platform-style `messaging: [...]` array, and a
 * `changes: [{ field: "messages", value: {...} }]` wrapper (the same
 * envelope other Graph API webhook fields like `comments` use). This type
 * — and the parser below — accept both rather than assuming one.
 */
export type InstagramMessagingEvent = {
  sender: { id: string }; // IGSID of the customer
  recipient: { id: string }; // the IG professional account's id
  timestamp: number | string;
  message?: {
    mid: string;
    text?: string;
    is_echo?: boolean; // true for messages the business itself sent
    attachments?: Array<{ type: string; payload?: { url?: string } }>;
  };
};

export type InstagramWebhookPayload = {
  object: string;
  entry: Array<{
    id: string; // the receiving IG professional account's id
    time: number;
    messaging?: InstagramMessagingEvent[];
    changes?: Array<{
      field: string;
      value: InstagramMessagingEvent;
    }>;
  }>;
};

export type ParsedIncomingMessage = {
  igBusinessAccountId: string;
  senderIgsid: string;
  content: string;
  createdAt: Date;
};

/** Meta sends timestamps as either seconds or milliseconds depending on delivery shape/version. */
function toDate(timestamp: number | string): Date {
  const value = Number(timestamp);
  // A millisecond epoch is 13 digits today; a seconds epoch is 10. Anything
  // under ~10^12 is almost certainly seconds and needs scaling up.
  const ms = value < 1_000_000_000_000 ? value * 1000 : value;
  return new Date(ms);
}

/**
 * Flattens a webhook payload into individual inbound customer messages,
 * skipping echoes (messages the business itself sent, which Meta also
 * delivers here) since Phase 2 only cares about DMs landing from customers.
 */
export function parseIncomingMessages(payload: InstagramWebhookPayload): ParsedIncomingMessage[] {
  const results: ParsedIncomingMessage[] = [];

  for (const entry of payload.entry ?? []) {
    const eventsFromMessaging = entry.messaging ?? [];
    const eventsFromChanges = (entry.changes ?? [])
      .filter((change) => change.field === "messages")
      .map((change) => change.value);

    for (const event of [...eventsFromMessaging, ...eventsFromChanges]) {
      if (!event.message || event.message.is_echo) continue;

      const content =
        event.message.text ??
        (event.message.attachments?.length ? `[${event.message.attachments[0].type} attachment]` : "");

      if (!content) continue;
      
      results.push({
        igBusinessAccountId: entry.id,
        senderIgsid: event.sender.id,
        content,
        createdAt: toDate(event.timestamp),
      });
    }
  }

  return results;
}
