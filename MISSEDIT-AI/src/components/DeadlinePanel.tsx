import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, HelpCircle, ExternalLink } from 'lucide-react';
import { DeadlineCategory, DeadlineItem } from '../types';

interface DeadlinePanelProps {
  deadlines: DeadlineItem[];
  onOpenMessage: (messageId: string) => void;
}

export const DeadlinePanel: React.FC<DeadlinePanelProps> = ({ deadlines, onOpenMessage }) => {
  const groups: { category: DeadlineCategory; title: string; desc: string; icon: any; color: string; bg: string }[] = [
    {
      category: 'due_today',
      title: 'Due Today / Tonight',
      desc: 'Immediate deliverables requiring close-of-business attention',
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60',
    },
    {
      category: 'upcoming',
      title: 'Upcoming Milestones',
      desc: 'Scheduled targets later this week or upcoming dates',
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60',
    },
    {
      category: 'overdue',
      title: 'Past / Overdue Items',
      desc: 'Milestones with past timestamps or previous days',
      icon: AlertTriangle,
      color: 'text-slate-500 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
    },
    {
      category: 'undated',
      title: 'Flexible / Undated Targets',
      desc: 'General time windows or ambiguous timelines',
      icon: HelpCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Timeline & Deadline Overview</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Grouped by delivery urgency extracted directly from conversation timestamps and deadline phrases.
        </p>
      </div>

      {deadlines.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
          No explicit deadlines detected in the analyzed messages.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((grp) => {
            const items = deadlines.filter((d) => d.category === grp.category);
            if (items.length === 0) return null;
            const Icon = grp.icon;

            return (
              <div key={grp.category} className={`p-5 rounded-xl border ${grp.bg} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${grp.color}`} />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {grp.title} ({items.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    {grp.desc}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                          {item.title}
                        </span>
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded shrink-0">
                          {item.dateText}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>Mentioned by {item.sender}</span>
                        <button
                          onClick={() => onOpenMessage(item.sourceMessageId)}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
