import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { Decision } from '../types';

interface DecisionsPanelProps {
  decisions: Decision[];
  onCopyDecisions: () => void;
  onOpenMessage: (messageId: string) => void;
}

export const DecisionsPanel: React.FC<DecisionsPanelProps> = ({
  decisions,
  onCopyDecisions,
  onOpenMessage,
}) => {
  const [filter, setFilter] = useState<'all' | 'final' | 'possible'>('all');

  const filteredDecisions = decisions.filter((d) => {
    if (filter === 'final' && d.confidence !== 'final') return false;
    if (filter === 'possible' && d.confidence !== 'possible') return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Key Decisions & Team Consensus</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Extracted commitments, architecture choices, approvals, and meeting shifts.
            </p>
          </div>

          <button
            onClick={onCopyDecisions}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Decisions</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Decisions ({decisions.length})
          </button>
          <button
            onClick={() => setFilter('final')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'final'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Final Decisions ({decisions.filter((d) => d.confidence === 'final').length})
          </button>
          <button
            onClick={() => setFilter('possible')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'possible'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Possible Proposals ({decisions.filter((d) => d.confidence === 'possible').length})
          </button>
        </div>
      </div>

      {/* Decisions List */}
      {filteredDecisions.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
          No decisions found matching this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDecisions.map((dec) => (
            <div
              key={dec.id}
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5">
                    {dec.confidence === 'final' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {dec.text}
                    </h4>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Announced by <strong className="text-slate-700 dark:text-slate-300">{dec.speaker}</strong> · {dec.timestamp}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border shrink-0 ${
                    dec.confidence === 'final'
                      ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                      : 'text-amber-700 bg-amber-50 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                  }`}
                >
                  {dec.confidence === 'final' ? 'Final Decision' : 'Possible Proposal'}
                </span>
              </div>

              {/* Source quotation */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between gap-2">
                <span className="truncate">"{dec.sourceText}"</span>
                <button
                  onClick={() => onOpenMessage(dec.sourceMessageId)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 flex items-center gap-1 text-[11px]"
                >
                  <span>Source</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
