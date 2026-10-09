import { ChatMessage } from '../types';

export interface ParseResult {
  messages: ChatMessage[];
  detectedSpeakers: string[];
  systemMessageCount: number;
  totalParsed: number;
  titleSuggestion: string;
  hasErrors: boolean;
  warnings: string[];
}

// Regex patterns for WhatsApp chat exports across iOS, Android, and Web
const PATTERNS = [
  // 12/10/2026, 10:30 AM - Rahul: The presentation is due Friday.
  // 10/12/26, 22:30 - Arun: We decided to move the meeting.
  // 12/10/26, 10:30 am - Rahul: text
  /^(?<date>\d{1,4}[-/. ]\d{1,2}[-/. ]\d{2,4}),?\s+(?<time>\d{1,2}:\d{2}(?::\d{2})?(?:\s*[apAP]\.?[mM]\.?)?)\s*[-—]\s*(?<sender>[^:\n\r]+?):\s*(?<content>[\s\S]*)$/,

  // [12/10/2026, 10:32:00 AM] Priya: I will prepare the slides.
  // [10/12/26, 22:30] Arun: We decided...
  /^\[(?<date>\d{1,4}[-/. ]\d{1,2}[-/. ]\d{2,4}),?\s+(?<time>\d{1,2}:\d{2}(?::\d{2})?(?:\s*[apAP]\.?[mM]\.?)?)\]\s*(?<sender>[^:\n\r]+?):\s*(?<content>[\s\S]*)$/,

  // 12/10/2026 10:30 - Rahul: Text without comma
  /^(?<date>\d{1,4}[-/. ]\d{1,2}[-/. ]\d{2,4})\s+(?<time>\d{1,2}:\d{2}(?::\d{2})?(?:\s*[apAP]\.?[mM]\.?)?)\s*[-—]\s*(?<sender>[^:\n\r]+?):\s*(?<content>[\s\S]*)$/,

  // System messages format: "12/10/2026, 10:30 AM - Messages and calls are end-to-end encrypted..."
  /^(?<date>\d{1,4}[-/. ]\d{1,2}[-/. ]\d{2,4}),?\s+(?<time>\d{1,2}:\d{2}(?::\d{2})?(?:\s*[apAP]\.?[mM]\.?)?)\s*[-—]\s*(?<content>[^:\n\r]+)$/,

  // System bracketed: "[12/10/2026, 10:30 AM] Messages and calls are..."
  /^\[(?<date>\d{1,4}[-/. ]\d{1,2}[-/. ]\d{2,4}),?\s+(?<time>\d{1,2}:\d{2}(?::\d{2})?(?:\s*[apAP]\.?[mM]\.?)?)\]\s*(?<content>[^:\n\r]+)$/,
];

const SYSTEM_PHRASES = [
  'end-to-end encrypted',
  'messages and calls are end-to-end',
  'added',
  'left',
  'removed',
  'changed the subject',
  'changed the group',
  'created this group',
  'you were added',
  'security code changed',
  'this message was deleted',
  'you deleted this message',
  '<media omitted>',
  'image omitted',
  'audio omitted',
  'video omitted',
  'sticker omitted',
  'document omitted',
  'contact card omitted',
];

function isSystemMessage(content: string, sender?: string): boolean {
  if (!sender) return true;
  const lower = content.toLowerCase().trim();
  const lowerSender = sender.toLowerCase().trim();
  if (lowerSender === 'system' || lowerSender === 'whatsapp') return true;
  return SYSTEM_PHRASES.some((phrase) => lower.includes(phrase));
}

function parseDateEstimate(dateStr: string, timeStr: string): Date | null {
  try {
    // Attempt standard parse
    const cleanDate = dateStr.replace(/\./g, '/').replace(/-/g, '/');
    const d = new Date(`${cleanDate} ${timeStr}`);
    if (!isNaN(d.getTime())) return d;
  } catch {
    // ignore
  }
  return null;
}

export function parseWhatsAppChat(rawText: string, defaultTitle = 'Imported Chat'): ParseResult {
  const lines = rawText.split(/\r?\n/);
  const messages: ChatMessage[] = [];
  const speakersSet = new Set<string>();
  const warnings: string[] = [];
  let systemMessageCount = 0;

  let currentMsg: Partial<ChatMessage> | null = null;
  let lineIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() && !currentMsg) continue;

    let matched = false;

    // Test each pattern against current line
    for (let pIndex = 0; pIndex < PATTERNS.length; pIndex++) {
      const pattern = PATTERNS[pIndex];
      const match = line.match(pattern);

      if (match && match.groups) {
        // We found a new message boundary!
        if (currentMsg) {
          // Flush the previous message
          messages.push(finalizeMessage(currentMsg, messages.length + 1));
          currentMsg = null;
        }

        const dateStr = match.groups.date?.trim() || '';
        const timeStr = match.groups.time?.trim() || '';
        const sender = match.groups.sender?.trim() || '';
        const content = match.groups.content?.trim() || '';

        const isSys = !sender || isSystemMessage(content, sender);
        if (isSys) {
          systemMessageCount++;
        } else if (sender) {
          speakersSet.add(sender);
        }

        const dateObj = parseDateEstimate(dateStr, timeStr);
        const timestamp = `${dateStr} ${timeStr}`.trim();

        currentMsg = {
          id: `msg-${Date.now()}-${lineIdx++}`,
          rawText: line,
          timestamp: timestamp || 'Undated',
          date: dateObj,
          sender: isSys ? 'System' : sender,
          content: content,
          isSystem: isSys,
          lineIndex: i + 1,
          confidence: 'high',
        };

        matched = true;
        break;
      }
    }

    if (!matched) {
      if (currentMsg) {
        // Multiline continuation: append to preceding message
        currentMsg.content += '\n' + line;
        currentMsg.rawText += '\n' + line;
      } else if (line.trim()) {
        // Tolerant fallback: preserve line with low-confidence so nothing is discarded
        const fallbackId = `msg-fallback-${Date.now()}-${lineIdx++}`;
        const isSys = isSystemMessage(line);
        if (isSys) systemMessageCount++;

        messages.push({
          id: fallbackId,
          rawText: line,
          timestamp: 'Unknown timestamp',
          date: null,
          sender: isSys ? 'System' : 'Unknown Speaker',
          content: line.trim(),
          isSystem: isSys,
          lineIndex: i + 1,
          confidence: 'low',
          priority: 'normal',
          priorityScore: 20,
          priorityReasons: ['Fallback message parsing'],
          detectedMentions: [],
          hasQuestion: line.includes('?'),
          hasReplyRequest: false,
          isDirectToMe: false,
        });
      }
    }
  }

  // Flush remaining currentMsg
  if (currentMsg) {
    messages.push(finalizeMessage(currentMsg, messages.length + 1));
  }

  if (messages.length === 0 && rawText.trim().length > 0) {
    warnings.push('Could not detect standard WhatsApp timestamps. Processed as freeform text lines.');
    // Create messages from non-empty lines
    lines.filter(l => l.trim()).forEach((line, idx) => {
      messages.push({
        id: `msg-freeform-${idx}`,
        rawText: line,
        timestamp: 'Text line ' + (idx + 1),
        date: null,
        sender: 'Participant',
        content: line.trim(),
        isSystem: false,
        lineIndex: idx + 1,
        confidence: 'low',
        priority: 'normal',
        priorityScore: 20,
        priorityReasons: ['Freeform line import'],
        detectedMentions: [],
        hasQuestion: line.includes('?'),
        hasReplyRequest: false,
        isDirectToMe: false,
      });
      speakersSet.add('Participant');
    });
  }

  // Derive suggested title
  let titleSuggestion = defaultTitle;
  if (speakersSet.size > 0) {
    const list = Array.from(speakersSet).slice(0, 3);
    if (speakersSet.size === 1) {
      titleSuggestion = `Chat with ${list[0]}`;
    } else if (speakersSet.size === 2) {
      titleSuggestion = `${list[0]} & ${list[1]}`;
    } else {
      titleSuggestion = `Group: ${list.join(', ')} (+${speakersSet.size - list.length} more)`;
    }
  }

  return {
    messages,
    detectedSpeakers: Array.from(speakersSet),
    systemMessageCount,
    totalParsed: messages.length,
    titleSuggestion,
    hasErrors: messages.length === 0 && rawText.trim().length > 0,
    warnings,
  };
}

function finalizeMessage(partial: Partial<ChatMessage>, index: number): ChatMessage {
  const content = partial.content || '';
  const sender = partial.sender || 'Unknown';
  const isSys = partial.isSystem || false;

  return {
    id: partial.id || `msg-${index}`,
    rawText: partial.rawText || content,
    timestamp: partial.timestamp || 'Undated',
    date: partial.date || null,
    sender,
    content,
    isSystem: isSys,
    lineIndex: partial.lineIndex || index,
    confidence: (partial.confidence as 'high' | 'medium' | 'low') || 'high',
    priority: 'normal',
    priorityScore: 0,
    priorityReasons: [],
    detectedMentions: [],
    hasQuestion: content.includes('?'),
    hasReplyRequest: false,
    isDirectToMe: false,
  };
}
