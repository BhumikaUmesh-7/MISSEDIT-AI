import React from 'react';
import { X, Copy, Check, MessageSquare, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { ChatMessage } from '../types';

interface MessageDetailsModalProps {
  message: ChatMessage | null;
  allMessages: ChatMessage[];
  onClose: () => void;
  onSelectMessage: (msg: ChatMessage) => void;
}

export const MessageDetailsModal: React.FC<MessageDetailsModalProps> = ({
  message,
  allMessages,
  onClose,
  onSelectMessage,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!message) return null;

  const currentIndex = allMessages.findIndex((m) => m.id === message.id);
  const prevMsg = currentIndex > 0 ? allMessages[currentIndex - 1] : null;
  const nextMsg = currentIndex < allMessages.length - 1 ? allMessages[currentIndex + 1] : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Message Inspection
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Line #{message.lineIndex} · ID: {message.id.slice(0, 16)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close message view"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* Sender & Timestamp */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Sender</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{message.sender}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Timestamp</div>
              <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">{message.timestamp}</div>
            </div>
          </div>

          {/* Full Message Text */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Original Message Content
            </div>
            <div className="p-4 bg-slate-50/70 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </div>
          </div>

          {/* Classification & Transparent Breakdown */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                Priority Classification
              </span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded shadow-2xs border border-indigo-100 dark:border-indigo-900">
                Score: {message.priorityScore} / 100 ({message.priority.toUpperCase()})
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">Determined by:</div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                {message.priorityReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Surrounding Context (Previous & Next messages) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Surrounding Conversation Context
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {prevMsg ? (
                <button
                  onClick={() => onSelectMessage(prevMsg)}
                  className="p-2.5 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
                    <ArrowLeft className="w-3 h-3" />
                    <span>Previous ({prevMsg.sender})</span>
                  </div>
                  <div className="truncate text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    {prevMsg.content}
                  </div>
                </button>
              ) : (
                <div className="p-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-center text-[11px]">
                  Start of conversation
                </div>
              )}

              {nextMsg ? (
                <button
                  onClick={() => onSelectMessage(nextMsg)}
                  className="p-2.5 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400 mb-0.5">
                    <span>Next ({nextMsg.sender})</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <div className="truncate text-slate-700 dark:text-slate-300 font-mono text-[11px] text-right">
                    {nextMsg.content}
                  </div>
                </button>
              ) : (
                <div className="p-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-center text-[11px]">
                  End of conversation
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
