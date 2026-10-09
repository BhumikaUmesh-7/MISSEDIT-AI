import { ChatMessage, DeadlineCategory, DeadlineItem } from '../types';

const DEADLINE_REGEX = /\b(?:due|deadline|submit\s+by|finish\s+by|send\s+by|by)\s+([A-Za-z0-9,:\s]{2,25}(?:am|pm|today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|eod|noon|midnight|\d{1,2}(?:st|nd|rd|th)?|\d{4}))/i;

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function extractDeadlines(messages: ChatMessage[]): DeadlineItem[] {
  const deadlines: DeadlineItem[] = [];
  const seenDates = new Set<string>();

  for (const msg of messages) {
    if (msg.isSystem) continue;
    const content = msg.content;

    const match = content.match(DEADLINE_REGEX);
    if (!match) continue;

    const dateText = match[1].trim();
    if (dateText.length < 3) continue;

    const lower = dateText.toLowerCase();

    // Categorization
    let category: DeadlineCategory = 'upcoming';
    let isAmbiguous = false;
    let title = content.split(/[.!?\n]/)[0].trim();
    if (title.length > 80) title = title.slice(0, 77) + '...';

    if (lower.includes('today') || lower.includes('tonight') || lower.includes('eod') || lower.includes('this afternoon')) {
      category = 'due_today';
    } else if (lower.includes('tomorrow') || DAYS_OF_WEEK.some(d => lower.includes(d)) || /\d{1,2}\s+[A-Za-z]+/.test(lower)) {
      category = 'upcoming';
    } else if (lower.includes('yesterday') || lower.includes('last week')) {
      category = 'overdue';
    } else {
      isAmbiguous = true;
      category = 'undated';
    }

    const key = `${dateText.toLowerCase()}-${msg.sender.toLowerCase()}`;
    if (seenDates.has(key)) continue;
    seenDates.add(key);

    deadlines.push({
      id: `deadline-${msg.id}-${deadlines.length}`,
      title,
      dateText,
      parsedDate: null,
      category,
      isAmbiguous,
      sourceMessageId: msg.id,
      sender: msg.sender,
      timestamp: msg.timestamp,
    });
  }

  return deadlines;
}
