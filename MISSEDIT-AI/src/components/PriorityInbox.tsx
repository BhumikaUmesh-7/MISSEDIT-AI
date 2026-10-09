import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  Flame,
  CheckCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  Calendar,
  AtSign,
  Info,
} from 'lucide-react';
import { ChatMessage, PriorityLevel } from '../types';

interface PriorityInboxProps {
  messages: ChatMessage[];
  onSelectMessage: (msg: ChatMessage) => void;
  currentUsername?: string;
}

export const PriorityInbox: React.FC<PriorityInboxProps> = ({
  messages,
  onSelectMessage,
  currentUsername = '',
}) => {
  const [filter, setFilter] = useState<'all' | PriorityLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [senderFilter, setSenderFilter] = useState('all');
  const [compactView, setCompactView] = useState(false);

  // Extract unique senders for filter dropdown
  const uniqueSenders = useMemo(() => {
    const set = new Set<string>();
    messages.forEach((m) => {
      if (!m.isSystem && m.sender) set.add(m.sender);
    });
    return Array.from(set).sort();
  }, [messages]);

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Priority filter
      if (filter !== 'all' && msg.priority !== filter) return false;

      // Sender filter
      if (senderFilter !== 'all' && msg.sender !== senderFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesContent = msg.content.toLowerCase().includes(q);
        const matchesSender = msg.sender.toLowerCase().includes(q);
        if (!matchesContent && !matchesSender) return false;
      }

      return true;
    });
  }, [messages, filter, senderFilter, searchQuery]);

  const priorityCounts = useMemo(() => {
    const counts = { all: messages.length, urgent: 0, important: 0, normal: 0, low: 0 };
    messages.forEach((m) => {
      if (m.priority in counts) {
        counts[m.priority as PriorityLevel]++;
      }
    });
    return counts;
  }, [messages]);

  const getPriorityBadge = (level: PriorityLevel) => {
    switch (level) {
      case 'urgent':
        return {
          label: 'Urgent',
          badgeClass: 'text-rose-700 bg-rose-50 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-900',
          dotClass: 'bg-rose-500',
        };
      case 'important':
        return {
          label: 'Important',
          badgeClass: 'text-amber-700 bg-amber-50 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900',
          dotClass: 'bg-amber-500',
        };
      case 'normal':
        return {
          label: 'Normal',
          badgeClass: 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          dotClass: 'bg-slate-400',
        };
      case 'low':
        return {
          label: 'Low Priority',
          badgeClass: 'text-slate-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800',
          dotClass: 'bg-slate-300',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages by sender or keyword..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Sender Filter Dropdown & View Mode */}
          <div className="flex items-center gap-2">
            <select
              value={senderFilter}
              onChange={(e) => setSenderFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Senders ({uniqueSenders.length})</option>
              {uniqueSenders.map((spk) => (
                <option key={spk} value={spk}>{spk}</option>
              ))}
            </select>

            <button
              onClick={() => setCompactView(!compactView)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
              title={compactView ? 'Switch to Detailed Cards' : 'Switch to Compact Rows'}
            >
              {compactView ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Priority Segmented Tabs (Buttons adhering to design discipline) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {(['all', 'urgent', 'important', 'normal', 'low'] as const).map((lvl) => {
            const count = priorityCounts[lvl];
            const isActive = filter === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span className="capitalize">{lvl === 'all' ? 'All Messages' : lvl}</span>
                <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-indigo-700 text-white' : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Listing */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Info className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching messages found</h4>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search term or selecting another priority filter.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredMessages.map((msg) => {
            const priorityInfo = getPriorityBadge(msg.priority);

            if (compactView) {
              return (
                <div
                  key={msg.id}
                  onClick={() => onSelectMessage(msg)}
                  className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${priorityInfo.dotClass}`} />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0 w-24 truncate">
                      {msg.sender}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      {msg.content}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${priorityInfo.badgeClass}`}>
                      {priorityInfo.label}
                    </span>
                    <span className="hidden sm:inline">{msg.timestamp}</span>
                  </div>
                </div>
              );
            }

            // Detailed Card View
            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg)}
                className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group space-y-2.5"
              >
                {/* Header: Sender, Timestamp, Priority Score */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${priorityInfo.dotClass}`} />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {msg.sender}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      · {msg.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${priorityInfo.badgeClass}`}>
                      {priorityInfo.label} (Score {msg.priorityScore})
                    </span>
                  </div>
                </div>

                {/* Message Content */}
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {msg.content}
                </p>

                {/* Transparent Reasoning Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Reason:</span>
                    {msg.priorityReasons.map((r, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        {r}
                      </span>
                    ))}
                  </div>

                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
