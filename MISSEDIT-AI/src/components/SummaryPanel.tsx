import React from 'react';
import {
  Copy,
  Download,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  Calendar,
  Scale,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface SummaryPanelProps {
  analysis: AnalysisResult;
  onNavigate: (tab: string) => void;
  onCopySummary: () => void;
  onExportReport: () => void;
  onSelectMessage: (msgId: string) => void;
  onToggleTask: (taskId: string) => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  analysis,
  onNavigate,
  onCopySummary,
  onExportReport,
  onSelectMessage,
  onToggleTask,
}) => {
  const { summary, stats, actionItems } = analysis;

  return (
    <div className="space-y-6">
      {/* Header bar with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Extractive Conversation Briefing</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {summary.headline}
          </h2>
          <p className="text-xs text-indigo-200">
            Synthesized from {stats.userMessages} messages across {stats.speakers.length} speakers
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Briefing</span>
          </button>
          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* TOP 3 NEXT ACTIONS SECTION */}
      {summary.topNextActions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Recommended Next Actions (What Should I Do First?)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View all {stats.totalTasks} items</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {summary.topNextActions.map((action, idx) => {
              const matchedTask = actionItems.find((t) => t.id === action.actionItemId);
              const isCompleted = matchedTask?.status === 'completed';

              return (
                <div
                  key={action.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-950/80 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        0{idx + 1}. PRIORITY
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        action.urgency === 'high'
                          ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {action.urgency.toUpperCase()}
                      </span>
                    </div>

                    <div className={`text-sm font-semibold text-slate-900 dark:text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {action.title}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {action.reason}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">From {action.sourceSender}</span>
                    {action.actionItemId && (
                      <button
                        onClick={() => onToggleTask(action.actionItemId!)}
                        className={`font-semibold hover:underline ${isCompleted ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}`}
                      >
                        {isCompleted ? 'Completed ✓' : 'Mark Done'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two-Column Deep Briefing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Critical Developments & Discussion Topics */}
        <div className="space-y-6">
          {/* Critical Developments */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Critical Developments & Alerts</span>
              </h3>
              <button
                onClick={() => onNavigate('priority')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Inspect Inbox
              </button>
            </div>

            <div className="space-y-2.5">
              {summary.criticalDevelopments.map((dev, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg text-xs text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800 leading-relaxed font-mono"
                >
                  {dev}
                </div>
              ))}
            </div>
          </div>

          {/* Key Discussion Topics */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-indigo-500" />
              <span>Discussion Themes & Timeline</span>
            </h3>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {summary.keyTopics.map((topic, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold shrink-0">·</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Decisions, Deadlines, and Requests For You */}
        <div className="space-y-6">
          {/* Requests for User */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Requests Directed At You</span>
              </h3>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Task Board
              </button>
            </div>

            <div className="space-y-2">
              {summary.requestsDirectedAtUser.map((req, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-lg text-xs text-slate-800 dark:text-slate-200 leading-relaxed"
                >
                  {req}
                </div>
              ))}
            </div>
          </div>

          {/* Top Decisions */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-500" />
                <span>Key Decisions Made</span>
              </h3>
              <button
                onClick={() => onNavigate('decisions')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all ({stats.decisionsCount})
              </button>
            </div>

            {summary.topDecisions.length > 0 ? (
              <div className="space-y-2">
                {summary.topDecisions.map((dec, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg text-xs text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800"
                  >
                    {dec}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 p-3">No explicit consensus or approvals detected.</div>
            )}
          </div>

          {/* Deadlines */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Upcoming Milestones</span>
              </h3>
              <button
                onClick={() => onNavigate('deadlines')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Calendar View
              </button>
            </div>

            {summary.keyDeadlines.length > 0 ? (
              <div className="space-y-2">
                {summary.keyDeadlines.map((dl, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                  >
                    {dl}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 p-3">No specific time deadlines extracted.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
