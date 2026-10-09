export type PriorityLevel = 'urgent' | 'important' | 'normal' | 'low';

export interface ChatMessage {
  id: string;
  rawText: string;
  timestamp: string;
  date: Date | null;
  sender: string;
  content: string;
  isSystem: boolean;
  lineIndex: number;
  confidence: 'high' | 'medium' | 'low';
  priority: PriorityLevel;
  priorityScore: number;
  priorityReasons: string[];
  detectedMentions: string[];
  hasQuestion: boolean;
  hasReplyRequest: boolean;
  isDirectToMe: boolean;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  assignmentType: 'assigned_to_me' | 'assigned_to_someone_else' | 'unclear';
  priority: PriorityLevel;
  status: 'pending' | 'completed';
  deadline: string | null;
  sourceMessageId: string;
  sender: string;
  timestamp: string;
  sourceText: string;
}

export interface Decision {
  id: string;
  text: string;
  speaker: string;
  timestamp: string;
  confidence: 'final' | 'possible';
  sourceMessageId: string;
  sourceText: string;
}

export type DeadlineCategory = 'overdue' | 'due_today' | 'upcoming' | 'undated';

export interface DeadlineItem {
  id: string;
  title: string;
  dateText: string;
  parsedDate: string | null;
  category: DeadlineCategory;
  isAmbiguous: boolean;
  sourceMessageId: string;
  sender: string;
  timestamp: string;
}

export interface MentionItem {
  id: string;
  type: 'mention' | 'direct_request' | 'question_for_me' | 'reply_request';
  sender: string;
  timestamp: string;
  sourceMessageId: string;
  sourceText: string;
  reason: string;
}

export interface ConversationStats {
  totalMessages: number;
  systemMessages: number;
  userMessages: number;
  speakers: string[];
  speakerMessageCounts: Record<string, number>;
  urgentCount: number;
  importantCount: number;
  normalCount: number;
  lowPriorityCount: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  tasksForMe: number;
  decisionsCount: number;
  mentionsCount: number;
  deadlinesCount: number;
  firstMessageTime: string;
  lastMessageTime: string;
  durationSpan: string;
}

export interface NextActionRecommendation {
  id: string;
  title: string;
  reason: string;
  urgency: 'high' | 'medium' | 'normal';
  sourceSender: string;
  sourceTime: string;
  sourceMessageId?: string;
  actionItemId?: string;
}

export interface AnalysisSummary {
  headline: string;
  keyTopics: string[];
  criticalDevelopments: string[];
  topDecisions: string[];
  keyDeadlines: string[];
  requestsDirectedAtUser: string[];
  topNextActions: NextActionRecommendation[];
}

export interface AnalysisResult {
  conversationTitle: string;
  currentUsername: string;
  messages: ChatMessage[];
  actionItems: ActionItem[];
  decisions: Decision[];
  deadlines: DeadlineItem[];
  mentions: MentionItem[];
  stats: ConversationStats;
  summary: AnalysisSummary;
  analyzedAt: string;
  rawInputLength: number;
}
