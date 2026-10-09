import { ChatMessage, PriorityLevel } from '../types';

interface ScoredPriority {
  level: PriorityLevel;
  score: number;
  reasons: string[];
}

const URGENT_TRIGGERS = [
  { pattern: /\b(urgent|urgently|asap|emergency|blocker|blocking|critical|down|broken|crash|fatal)\b/i, weight: 45, reason: 'High-urgency alert vocabulary' },
  { pattern: /\b(immediately|right now|at once|by today|within an hour)\b/i, weight: 35, reason: 'Time-critical execution window' },
  { pattern: /\b(deadline is today|due today|submit today)\b/i, weight: 40, reason: 'Immediate deadline today' },
  { pattern: /!{2,}/, weight: 15, reason: 'High emphatic punctuation (!!)' },
];

const IMPORTANT_TRIGGERS = [
  { pattern: /\b(deadline|due date|due by|submit by|deliverable)\b/i, weight: 25, reason: 'Upcoming milestone/deadline' },
  { pattern: /\b(please check|please review|can you send|could you share|need you to)\b/i, weight: 20, reason: 'Explicit review or asset request' },
  { pattern: /\b(we decided|we agreed|final call|consensus|approved)\b/i, weight: 25, reason: 'Team decision or sign-off' },
  { pattern: /\b(action item|to-do|todo|assigned to)\b/i, weight: 25, reason: 'Task assignment phrase' },
  { pattern: /\b(meeting at|sync at|call scheduled|zoom link|google meet)\b/i, weight: 20, reason: 'Calendar or synchronous sync update' },
];

const LOW_INFO_TRIGGERS = [
  { pattern: /^(ok|okay|k|cool|sure|yep|yes|no|nope|lol|haha|hahaha|nice|thanks|thx|ty|great|got it|noted|sounds good|👍|🙏|🔥|❤️|😂)$/i, deduction: 30, reason: 'Routine conversational acknowledgement' },
  { pattern: /^(gm|gn|good morning|good night|hello|hi|hey)$/i, deduction: 25, reason: 'Salutation without action' },
];

export function calculatePriority(message: ChatMessage, currentUsername = ''): ScoredPriority {
  if (message.isSystem) {
    return { level: 'low', score: 5, reasons: ['Automated system notification'] };
  }

  let score = 20; // baseline
  const reasons: string[] = [];
  const text = message.content;
  const lower = text.toLowerCase();
  const cleanUser = currentUsername.trim().toLowerCase();

  // 1. Direct mention / addressed to user check
  const isAddressedToUser =
    cleanUser.length >= 2 &&
    (lower.includes(`@${cleanUser}`) ||
     new RegExp(`\\b${cleanUser}\\b`, 'i').test(text));

  if (isAddressedToUser) {
    score += 35;
    reasons.push(`Directly addresses you (${currentUsername})`);
  } else if (text.includes('@')) {
    score += 15;
    reasons.push('Contains explicit @mention');
  }

  // 2. Urgent Triggers
  for (const trigger of URGENT_TRIGGERS) {
    if (trigger.pattern.test(text)) {
      score += trigger.weight;
      reasons.push(trigger.reason);
    }
  }

  // 3. Important Triggers
  for (const trigger of IMPORTANT_TRIGGERS) {
    if (trigger.pattern.test(text)) {
      score += trigger.weight;
      reasons.push(trigger.reason);
    }
  }

  // 4. Questions
  if (text.includes('?')) {
    if (isAddressedToUser) {
      score += 25;
      reasons.push('Direct question awaiting your reply');
    } else {
      score += 10;
      reasons.push('Open question asked to group');
    }
  }

  // 5. Low info deductions
  const trimmed = text.trim();
  for (const trigger of LOW_INFO_TRIGGERS) {
    if (trigger.pattern.test(trimmed)) {
      score -= trigger.deduction;
      reasons.push(trigger.reason);
    }
  }

  // Message length penalty if too short without keywords
  if (trimmed.length < 15 && !reasons.length) {
    score -= 10;
  }

  // Final clamp and classification
  score = Math.max(0, Math.min(100, score));

  let level: PriorityLevel = 'normal';
  if (score >= 60) {
    level = 'urgent';
  } else if (score >= 38) {
    level = 'important';
  } else if (score <= 15) {
    level = 'low';
  } else {
    level = 'normal';
  }

  if (reasons.length === 0) {
    reasons.push('Standard group conversation message');
  }

  return { level, score, reasons };
}
