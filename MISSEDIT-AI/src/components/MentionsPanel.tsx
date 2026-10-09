import React, { useState } from 'react';
import { AtSign, HelpCircle, MessageSquareQuote, CheckCircle, ExternalLink } from 'lucide-react';
import { MentionItem } from '../types';

interface MentionsPanelProps {
  mentions: MentionItem[];
  onOpenMessage: (messageId: string) => void;
  currentUsername?: string;
}

export const MentionsPanel: React.FC<MentionsPanelProps> = ({
  mentions,
  onOpenMessage,
  currentUsername = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'mention' | 'question_for_me' | 'reply_request' | 'direct_request'>('all');

  const filteredMentions = mentions.filter((m) => {
    if (filter === 'all') return true;
    return m.type === filter;
  });

  const getTypeLabel = (type: MentionItem['type']) => {
    switch (type) {
      case 'mention':
        return { label: '@Mention', class: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300' };
      case 'question_for_me':
        return { label: 'Question For You', class: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300' };
      case 'direct_request':
        return { label: 'Direct Request', class: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300' };
      case 'reply_request':
        return { label: 'Reply Requested', class: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AtSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Mentions, Callouts & Reply Requests</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentUsername
              ? `Filtered specifically for queries or mentions targeting "${currentUsername}" & open group questions.`
              : 'Messages containing direct @mentions and questions awaiting replies.'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Callouts ({mentions.length})
          </button>
          <button
            onClick={() => setFilter('mention')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'mention' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            @Mentions ({mentions.filter((m) => m.type === 'mention').length})
          </button>
          <button
            onClick={() => setFilter('question_for_me')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'question_for_me' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Questions ({mentions.filter((m) => m.type === 'question_for_me').length})
          </button>
          <button
            onClick={() => setFilter('reply_request')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'reply_request' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Reply Requests ({mentions.filter((m) => m.type === 'reply_request').length})
          </button>
        </div>
      </div>

      {/* List */}
      {filteredMentions.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
          No mentions or reply requests found in this view.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMentions.map((item) => {
            const badge = getTypeLabel(item.type);
            return (
              <div
                key={item.id}
                className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.sender}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      · {item.timestamp}
                    </span>
                  </div>

                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded ${badge.class}`}>
                    {badge.label}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {item.sourceText}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Trigger: <strong className="text-slate-600 dark:text-slate-300 font-normal">{item.reason}</strong>
                  </span>
                  <button
                    onClick={() => onOpenMessage(item.sourceMessageId)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>View in Context</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
