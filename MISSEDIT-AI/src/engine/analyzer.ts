import { ActionItem, AnalysisResult, ChatMessage, ConversationStats } from '../types';
import { extractActionItems } from './actionItems';
import { extractDeadlines } from './deadlines';
import { extractDecisions } from './decisions';
import { extractMentions } from './mentions';
import { calculatePriority } from './priority';
import { generateSummary } from './summarizer';
import { parseWhatsAppChat } from './whatsappParser';

export function analyzeConversation(
  rawText: string,
  currentUsername = '',
  conversationTitle = 'WhatsApp Conversation'
): AnalysisResult {
  // Step 1: Parse messages
  const parseResult = parseWhatsAppChat(rawText, conversationTitle);
  const rawMessages = parseResult.messages;

  // Step 2: Score priority on each message
  const scoredMessages: ChatMessage[] = rawMessages.map((msg) => {
    const scored = calculatePriority(msg, currentUsername);
    const mentionsFound = (msg.content.match(/@([A-Za-z0-9_]+)/g) || []).map((m) => m.replace('@', ''));
    const isDirectToMe = currentUsername
      ? msg.content.toLowerCase().includes(`@${currentUsername.toLowerCase()}`) ||
        new RegExp(`\\b${currentUsername}\\b`, 'i').test(msg.content)
      : false;

    return {
      ...msg,
      priority: scored.level,
      priorityScore: scored.score,
      priorityReasons: scored.reasons,
      detectedMentions: mentionsFound,
      hasQuestion: msg.content.includes('?'),
      hasReplyRequest: scored.reasons.some((r) => r.toLowerCase().includes('reply') || r.toLowerCase().includes('question')),
      isDirectToMe,
    };
  });

  // Step 3: Extract structured items
  const actionItems: ActionItem[] = extractActionItems(scoredMessages, currentUsername);
  const decisions = extractDecisions(scoredMessages);
  const deadlines = extractDeadlines(scoredMessages);
  const mentions = extractMentions(scoredMessages, currentUsername);

  // Step 4: Calculate accurate statistics
  const userMessages = scoredMessages.filter((m) => !m.isSystem);
  const speakerCounts: Record<string, number> = {};
  userMessages.forEach((m) => {
    speakerCounts[m.sender] = (speakerCounts[m.sender] || 0) + 1;
  });

  const urgentCount = userMessages.filter((m) => m.priority === 'urgent').length;
  const importantCount = userMessages.filter((m) => m.priority === 'important').length;
  const normalCount = userMessages.filter((m) => m.priority === 'normal').length;
  const lowPriorityCount = userMessages.filter((m) => m.priority === 'low').length;

  const firstMsg = userMessages[0];
  const lastMsg = userMessages[userMessages.length - 1];

  const stats: ConversationStats = {
    totalMessages: scoredMessages.length,
    systemMessages: parseResult.systemMessageCount,
    userMessages: userMessages.length,
    speakers: Object.keys(speakerCounts),
    speakerMessageCounts: speakerCounts,
    urgentCount,
    importantCount,
    normalCount,
    lowPriorityCount,
    totalTasks: actionItems.length,
    completedTasks: 0,
    pendingTasks: actionItems.length,
    tasksForMe: actionItems.filter((t) => t.assignmentType === 'assigned_to_me').length,
    decisionsCount: decisions.length,
    mentionsCount: mentions.length,
    deadlinesCount: deadlines.length,
    firstMessageTime: firstMsg ? firstMsg.timestamp : 'N/A',
    lastMessageTime: lastMsg ? lastMsg.timestamp : 'N/A',
    durationSpan: firstMsg && lastMsg ? `${firstMsg.timestamp} → ${lastMsg.timestamp}` : 'N/A',
  };

  // Step 5: Generate extractive summary
  const summary = generateSummary(scoredMessages, actionItems, decisions, deadlines, currentUsername);

  return {
    conversationTitle: parseResult.titleSuggestion || conversationTitle,
    currentUsername,
    messages: scoredMessages,
    actionItems,
    decisions,
    deadlines,
    mentions,
    stats,
    summary,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    rawInputLength: rawText.length,
  };
}
