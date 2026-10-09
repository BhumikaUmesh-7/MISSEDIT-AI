import React from 'react';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  Scale,
  AtSign,
  Users,
  Clock,
} from 'lucide-react';
import { ConversationStats } from '../types';

interface MetricCardsProps {
  stats: ConversationStats;
  onNavigate: (tab: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ stats, onNavigate }) => {
  const cards = [
    {
      id: 'messages',
      label: 'Messages Analyzed',
      value: stats.userMessages,
      secondary: `${stats.systemMessages} system logs excluded`,
      icon: MessageSquare,
      color: 'text-slate-900 dark:text-white',
      iconBg: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
      tab: 'priority',
    },
    {
      id: 'urgent',
      label: 'Urgent Alerts',
      value: stats.urgentCount,
      secondary: stats.urgentCount > 0 ? 'Requires immediate action' : 'Zero active blockers',
      icon: AlertTriangle,
      color: stats.urgentCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white',
      iconBg: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400',
      tab: 'priority',
    },
    {
      id: 'tasks',
      label: 'Pending Tasks',
      value: stats.pendingTasks,
      secondary: `${stats.completedTasks} completed · ${stats.tasksForMe} for you`,
      icon: ListTodo,
      color: 'text-amber-600 dark:text-amber-400',
      iconBg: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400',
      tab: 'tasks',
    },
    {
      id: 'decisions',
      label: 'Key Decisions',
      value: stats.decisionsCount,
      secondary: 'Consensus & approvals',
      icon: Scale,
      color: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
      tab: 'decisions',
    },
    {
      id: 'mentions',
      label: 'Mentions & Queries',
      value: stats.mentionsCount,
      secondary: 'Callouts awaiting replies',
      icon: AtSign,
      color: 'text-sky-600 dark:text-sky-400',
      iconBg: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-400',
      tab: 'mentions',
    },
    {
      id: 'speakers',
      label: 'Active Speakers',
      value: stats.speakers.length,
      secondary: stats.durationSpan !== 'N/A' ? stats.durationSpan.slice(0, 24) : 'Single thread',
      icon: Users,
      color: 'text-slate-900 dark:text-white',
      iconBg: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
      tab: 'dashboard',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onNavigate(card.tab)}
            className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {card.label}
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className={`text-2xl font-bold tracking-tight tabular-nums font-mono ${card.color}`}>
              {card.value}
            </div>

            <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {card.secondary}
            </div>
          </div>
        );
      })}
    </div>
  );
};
