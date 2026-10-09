import { ActionItem, AnalysisSummary, ChatMessage, Decision, DeadlineItem, NextActionRecommendation } from '../types';

export function generateSummary(
  messages: ChatMessage[],
  actionItems: ActionItem[],
  decisions: Decision[],
  deadlines: DeadlineItem[],
  currentUsername = ''
): AnalysisSummary {
  const userMessages = messages.filter((m) => !m.isSystem);

  // 1. Derive concise headline
  let headline = 'Conversation Analysis Briefing';
  if (userMessages.length > 0) {
    const urgentCount = userMessages.filter((m) => m.priority === 'urgent').length;
    const taskCount = actionItems.length;

    if (urgentCount > 0) {
      headline = `${urgentCount} urgent item${urgentCount > 1 ? 's' : ''} detected across ${userMessages.length} messages requiring immediate attention`;
    } else if (taskCount > 0) {
      headline = `Active workstream identified: ${taskCount} action item${taskCount > 1 ? 's' : ''} and ${decisions.length} decision${decisions.length === 1 ? '' : 's'}`;
    } else {
      headline = `Overview of ${userMessages.length} messages with key discussion threads extracted`;
    }
  }

  // 2. Main Discussion Topics (frequency analysis on important nouns & phrases)
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'you', 'have', 'are', 'was', 'were',
    'will', 'can', 'from', 'they', 'what', 'when', 'where', 'which', 'your', 'about',
    'just', 'like', 'been', 'some', 'them', 'then', 'than', 'into', 'only', 'also',
    'more', 'very', 'here', 'there', 'make', 'good', 'need', 'please', 'thanks',
  ]);

  const wordFreq: Record<string, number> = {};
  for (const m of userMessages) {
    const words = m.content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/);

    for (const w of words) {
      if (w.length > 3 && !stopWords.has(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    }
  }

  const sortedKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

  const keyTopics: string[] = [];
  if (sortedKeywords.length > 0) {
    keyTopics.push(`Core themes: ${sortedKeywords.join(', ')}`);
  }
  // Add conversation span topic
  if (userMessages.length > 0) {
    const first = userMessages[0];
    const last = userMessages[userMessages.length - 1];
    keyTopics.push(`Discussion period spans from ${first.timestamp} to ${last.timestamp}`);
  }

  // 3. Critical Developments (Urgent and high-priority messages)
  const criticalDevelopments: string[] = [];
  const urgentMsgs = userMessages.filter((m) => m.priority === 'urgent');

  if (urgentMsgs.length > 0) {
    urgentMsgs.slice(0, 4).forEach((m) => {
      criticalDevelopments.push(`[${m.sender} @ ${m.timestamp}]: "${m.content.slice(0, 140)}${m.content.length > 140 ? '...' : ''}"`);
    });
  } else {
    // Take important messages if no urgent
    const importantMsgs = userMessages.filter((m) => m.priority === 'important');
    if (importantMsgs.length > 0) {
      importantMsgs.slice(0, 3).forEach((m) => {
        criticalDevelopments.push(`[${m.sender}]: "${m.content.slice(0, 140)}${m.content.length > 140 ? '...' : ''}"`);
      });
    } else {
      criticalDevelopments.push('No urgent blockers or critical alerts detected in this chat segment.');
    }
  }

  // 4. Decisions
  const topDecisions: string[] = decisions.slice(0, 4).map((d) => {
    return `${d.speaker}: ${d.text} (${d.confidence === 'final' ? 'Final' : 'Proposed'})`;
  });

  // 5. Deadlines
  const keyDeadlines: string[] = deadlines.slice(0, 4).map((dl) => {
    return `"${dl.title}" — target: ${dl.dateText} (raised by ${dl.sender})`;
  });

  // 6. Requests directed at user
  const cleanUser = currentUsername.trim().toLowerCase();
  const requestsDirectedAtUser: string[] = [];

  const userTasks = actionItems.filter((t) => t.assignmentType === 'assigned_to_me');
  userTasks.forEach((t) => {
    requestsDirectedAtUser.push(`${t.sender} requested: ${t.description}${t.deadline ? ` (Due: ${t.deadline})` : ''}`);
  });

  if (cleanUser && requestsDirectedAtUser.length === 0) {
    requestsDirectedAtUser.push(`No explicit tasks directly assigned to "${currentUsername}".`);
  }

  // 7. Top 3 Next Actions (Ranked by urgency, deadline proximity, and direct assignment)
  const candidateActions: NextActionRecommendation[] = [];

  // Sort action items: assigned to user first, then urgent priority, then with deadlines
  const sortedTasks = [...actionItems].sort((a, b) => {
    if (a.assignmentType === 'assigned_to_me' && b.assignmentType !== 'assigned_to_me') return -1;
    if (b.assignmentType === 'assigned_to_me' && a.assignmentType !== 'assigned_to_me') return 1;
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    return 0;
  });

  sortedTasks.slice(0, 3).forEach((task, idx) => {
    let reason = 'High priority action identified from chat';
    if (task.assignmentType === 'assigned_to_me') {
      reason = `Directly assigned to you by ${task.sender}`;
    } else if (task.deadline) {
      reason = `Approaching milestone (${task.deadline})`;
    } else if (task.priority === 'urgent') {
      reason = `Time-sensitive deliverable requested by ${task.sender}`;
    }

    candidateActions.push({
      id: `rec-${idx}-${task.id}`,
      title: task.description,
      reason,
      urgency: task.priority === 'urgent' ? 'high' : task.priority === 'important' ? 'medium' : 'normal',
      sourceSender: task.sender,
      sourceTime: task.timestamp,
      sourceMessageId: task.sourceMessageId,
      actionItemId: task.id,
    });
  });

  return {
    headline,
    keyTopics,
    criticalDevelopments,
    topDecisions,
    keyDeadlines,
    requestsDirectedAtUser,
    topNextActions: candidateActions,
  };
}
