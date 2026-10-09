import { ChatMessage, MentionItem } from '../types';

export function extractMentions(messages: ChatMessage[], currentUsername = ''): MentionItem[] {
  const mentions: MentionItem[] = [];
  const cleanUser = currentUsername.trim().toLowerCase();

  for (const msg of messages) {
    if (msg.isSystem) continue;

    const content = msg.content;
    const lowerContent = content.toLowerCase();

    // 1. Explicit @username mention
    const explicitAtMatch = content.match(/@([A-Za-z0-9_]+)/g);
    let matchedUserMention = false;

    if (explicitAtMatch) {
      for (const rawAt of explicitAtMatch) {
        const handle = rawAt.replace('@', '').toLowerCase();
        if (cleanUser && (handle === cleanUser || cleanUser.includes(handle))) {
          matchedUserMention = true;
          mentions.push({
            id: `mention-${msg.id}-${mentions.length}`,
            type: 'mention',
            sender: msg.sender,
            timestamp: msg.timestamp,
            sourceMessageId: msg.id,
            sourceText: content,
            reason: `Direct @${rawAt.replace('@', '')} mention tag`,
          });
          break;
        } else if (!cleanUser) {
          // If no username provided, still track explicit @mentions
          mentions.push({
            id: `mention-${msg.id}-${mentions.length}`,
            type: 'mention',
            sender: msg.sender,
            timestamp: msg.timestamp,
            sourceMessageId: msg.id,
            sourceText: content,
            reason: `Direct mention: ${rawAt}`,
          });
          break;
        }
      }
    }

    if (matchedUserMention) continue;

    // 2. Direct name callout with username
    if (cleanUser && cleanUser.length >= 2) {
      const nameCalloutRegex = new RegExp(`(?:^|[\\s,;:])(?:hey\\s+|hi\\s+)?${cleanUser}[,:]?\\s+`, 'i');
      if (nameCalloutRegex.test(content)) {
        if (content.includes('?')) {
          mentions.push({
            id: `mention-${msg.id}-${mentions.length}`,
            type: 'question_for_me',
            sender: msg.sender,
            timestamp: msg.timestamp,
            sourceMessageId: msg.id,
            sourceText: content,
            reason: `Direct question addressed to ${currentUsername}`,
          });
        } else {
          mentions.push({
            id: `mention-${msg.id}-${mentions.length}`,
            type: 'direct_request',
            sender: msg.sender,
            timestamp: msg.timestamp,
            sourceMessageId: msg.id,
            sourceText: content,
            reason: `Direct statement addressed to ${currentUsername}`,
          });
        }
        continue;
      }
    }

    // 3. Question awaiting response
    if (content.includes('?') && /\b(who|anyone|anybody|can someone|could someone|thoughts\?|feedback\?|update\?)\b/i.test(content)) {
      mentions.push({
        id: `mention-${msg.id}-${mentions.length}`,
        type: 'reply_request',
        sender: msg.sender,
        timestamp: msg.timestamp,
        sourceMessageId: msg.id,
        sourceText: content,
        reason: 'Group question actively seeking a response or consensus',
      });
      continue;
    }

    // 4. General reply request
    if (/\b(please reply|let me know|confirm when|rsvp|ping me back)\b/i.test(content)) {
      mentions.push({
        id: `mention-${msg.id}-${mentions.length}`,
        type: 'reply_request',
        sender: msg.sender,
        timestamp: msg.timestamp,
        sourceMessageId: msg.id,
        sourceText: content,
        reason: 'Call for reply or confirmation',
      });
    }
  }

  return mentions;
}
