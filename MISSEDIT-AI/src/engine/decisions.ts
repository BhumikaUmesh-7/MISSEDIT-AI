import { ChatMessage, Decision } from '../types';

interface DecisionPattern {
  regex: RegExp;
  confidence: 'final' | 'possible';
  extract: (match: RegExpMatchArray, text: string) => string;
}

const DECISION_PATTERNS: DecisionPattern[] = [
  {
    regex: /\b(?:we\s+decided\s+(?:to|that)?|we've\s+decided\s+(?:to|that)?)\s+([^.!?\n]+)/i,
    confidence: 'final',
    extract: (m) => `Decided to ${m[1].trim()}`,
  },
  {
    regex: /\b(?:we\s+agreed\s+(?:to|on|that)?|team\s+agreed\s+(?:to|on)?)\s+([^.!?\n]+)/i,
    confidence: 'final',
    extract: (m) => `Agreed on: ${m[1].trim()}`,
  },
  {
    regex: /\b(?:final\s+decision:?|final\s+call:?)\s*([^.!?\n]+)/i,
    confidence: 'final',
    extract: (m) => m[1].trim(),
  },
  {
    regex: /\b(?:approved:?|approval\s+granted)\s*([^.!?\n]*)/i,
    confidence: 'final',
    extract: (m, full) => m[1].trim() ? `Approved: ${m[1].trim()}` : full.trim(),
  },
  {
    regex: /\b(?:confirmed\s+that|officially\s+moving\s+to|meeting\s+is\s+moved\s+to)\s+([^.!?\n]+)/i,
    confidence: 'final',
    extract: (m) => m[0].trim(),
  },
  {
    regex: /\b(?:let's\s+go\s+with|lets\s+go\s+with|going\s+with)\s+([^.!?\n]+)/i,
    confidence: 'possible',
    extract: (m) => `Selected: ${m[1].trim()}`,
  },
  {
    regex: /\b(?:the\s+plan\s+is\s+to|our\s+plan\s+is)\s+([^.!?\n]+)/i,
    confidence: 'possible',
    extract: (m) => `Plan: ${m[1].trim()}`,
  },
  {
    regex: /\b(?:we\s+will\s+proceed\s+with|proceeding\s+with)\s+([^.!?\n]+)/i,
    confidence: 'final',
    extract: (m) => `Proceeding with: ${m[1].trim()}`,
  },
];

export function extractDecisions(messages: ChatMessage[]): Decision[] {
  const decisions: Decision[] = [];
  const seenTexts = new Set<string>();

  for (const msg of messages) {
    if (msg.isSystem) continue;
    const content = msg.content;

    for (const pattern of DECISION_PATTERNS) {
      const match = content.match(pattern.regex);
      if (!match) continue;

      const raw = pattern.extract(match, content);
      const clean = raw.replace(/[.!?]+$/, '').trim();
      if (clean.length < 6) continue;

      const key = clean.toLowerCase().slice(0, 30);
      if (seenTexts.has(key)) continue;
      seenTexts.add(key);

      decisions.push({
        id: `decision-${msg.id}-${decisions.length}`,
        text: clean,
        speaker: msg.sender,
        timestamp: msg.timestamp,
        confidence: pattern.confidence,
        sourceMessageId: msg.id,
        sourceText: msg.content,
      });

      break;
    }
  }

  return decisions;
}
