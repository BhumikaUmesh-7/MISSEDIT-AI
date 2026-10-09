import { ActionItem, ChatMessage, PriorityLevel } from '../types';

interface TaskPattern {
  regex: RegExp;
  extract: (match: RegExpMatchArray, msg: ChatMessage) => string;
  defaultPriority: PriorityLevel;
}

const TASK_PATTERNS: TaskPattern[] = [
  {
    regex: /(?:please|pls)\s+(?:review|check|complete|send|update|fix|prepare|submit|upload|test|share|create)\s+([^.!?\n]+)/i,
    extract: (m) => m[0].trim(),
    defaultPriority: 'important',
  },
  {
    regex: /(?:need\s+to|have\s+to|we\s+need\s+to|must)\s+([^.!?\n]+)/i,
    extract: (m) => `Need to ${m[1].trim()}`,
    defaultPriority: 'important',
  },
  {
    regex: /(?:can\s+you|could\s+you|would\s+you\s+mind)\s+(?:please\s+)?([^.!?\n]+)/i,
    extract: (m) => `Request: ${m[1].trim()}`,
    defaultPriority: 'important',
  },
  {
    regex: /(?:assigned\s+to|action\s+item:?|todo:?)\s*([A-Za-z0-9_@]+)?\s*[-:]?\s*([^.!?\n]+)/i,
    extract: (m) => m[2] ? m[2].trim() : m[0].trim(),
    defaultPriority: 'urgent',
  },
  {
    regex: /(?:don't\s+forget\s+to|remember\s+to|make\s+sure\s+to)\s+([^.!?\n]+)/i,
    extract: (m) => `Make sure to ${m[1].trim()}`,
    defaultPriority: 'important',
  },
  {
    regex: /(?:submit\s+by|finish\s+by|send\s+by|complete\s+by)\s+([^.!?\n]+)/i,
    extract: (m) => m[0].trim(),
    defaultPriority: 'urgent',
  },
  {
    // First person commitment: "I will...", "I'll handle..."
    regex: /(?:i\s+will|i'll|i\s+can)\s+(?:take\s+care\s+of|handle|do|prepare|write|code|deploy|submit|review|update)\s+([^.!?\n]+)/i,
    extract: (m, msg) => `${msg.sender} will ${m[1].trim()}`,
    defaultPriority: 'normal',
  },
];

export function extractActionItems(messages: ChatMessage[], currentUsername = ''): ActionItem[] {
  const items: ActionItem[] = [];
  const seenTexts = new Set<string>();
  const cleanUser = currentUsername.trim().toLowerCase();

  for (const msg of messages) {
    if (msg.isSystem) continue;

    const content = msg.content;
    const lowerContent = content.toLowerCase();

    for (const pattern of TASK_PATTERNS) {
      const match = content.match(pattern.regex);
      if (!match) continue;

      const rawDescription = pattern.extract(match, msg);
      const cleanDesc = cleanDescription(rawDescription);

      if (cleanDesc.length < 5) continue;

      // Deduplicate similar descriptions
      const normKey = cleanDesc.toLowerCase().slice(0, 30);
      if (seenTexts.has(normKey)) continue;
      seenTexts.add(normKey);

      // Determine assignee and assignment type
      let assignee = 'Unassigned';
      let assignmentType: ActionItem['assignmentType'] = 'unclear';

      // Check if message is a first-person commitment from sender
      const isFirstPerson = /^(i\s+will|i'll|i\s+can)\b/i.test(match[0].trim());

      if (isFirstPerson) {
        // Sender promised to do it
        assignee = msg.sender;
        if (cleanUser && msg.sender.toLowerCase() === cleanUser) {
          assignmentType = 'assigned_to_me';
        } else {
          assignmentType = 'assigned_to_someone_else';
        }
      } else {
        // Check for direct mention of current user or another user
        const mentionMatches = content.match(/@([A-Za-z0-9_]+)/g);
        if (mentionMatches && mentionMatches.length > 0) {
          const mentionedName = mentionMatches[0].replace('@', '').trim();
          assignee = mentionedName;
          if (cleanUser && (mentionedName.toLowerCase() === cleanUser || cleanUser.includes(mentionedName.toLowerCase()))) {
            assignmentType = 'assigned_to_me';
          } else {
            assignmentType = 'assigned_to_someone_else';
          }
        } else if (cleanUser && (lowerContent.startsWith(cleanUser) || new RegExp(`\\b${cleanUser}\\b`, 'i').test(content))) {
          // Direct addressing: "Alex, please finish the UI"
          assignee = currentUsername;
          assignmentType = 'assigned_to_me';
        } else {
          // Check if another known name is addressed at the start: "Rahul, please..."
          const directAddressMatch = content.match(/^([A-Z][a-z]+)[,:]\s+/);
          if (directAddressMatch) {
            assignee = directAddressMatch[1];
            if (cleanUser && assignee.toLowerCase() === cleanUser) {
              assignmentType = 'assigned_to_me';
            } else {
              assignmentType = 'assigned_to_someone_else';
            }
          }
        }
      }

      // Extract potential deadline from message
      const deadlineMatch = content.match(/\b(?:by|before|due)\s+([A-Za-z0-9, ]{2,20})/i);
      const deadline = deadlineMatch ? deadlineMatch[0].trim() : null;

      // Priority adjustments based on message urgency
      let itemPriority = pattern.defaultPriority;
      if (msg.priority === 'urgent' || assignmentType === 'assigned_to_me') {
        itemPriority = 'urgent';
      }

      items.push({
        id: `task-${msg.id}-${items.length}`,
        description: cleanDesc,
        assignee,
        assignmentType,
        priority: itemPriority,
        status: 'pending',
        deadline,
        sourceMessageId: msg.id,
        sender: msg.sender,
        timestamp: msg.timestamp,
        sourceText: msg.content,
      });

      break; // One primary task per pattern match per message
    }
  }

  return items;
}

function cleanDescription(text: string): string {
  return text
    .replace(/^please\s+/i, '')
    .replace(/^pls\s+/i, '')
    .replace(/[.!?]+$/, '')
    .trim();
}
