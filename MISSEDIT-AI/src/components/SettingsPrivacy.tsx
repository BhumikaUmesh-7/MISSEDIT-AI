import React from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  FileCode,
  FileText,
  Info,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface SettingsPrivacyProps {
  analysis: AnalysisResult | null;
  onClearAll: () => void;
  onExportJson: () => void;
  onExportTxt: () => void;
}

export const SettingsPrivacy: React.FC<SettingsPrivacyProps> = ({
  analysis,
  onClearAll,
  onExportJson,
  onExportTxt,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Privacy & Local Processing Architecture
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              MissedIt AI is engineered with a strict local-first, zero-telemetry boundary.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>100% In-Browser Execution</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All text parsing, priority scoring, task extraction, decision recognition, and deadline calculations execute exclusively inside your browser's JavaScript engine.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Zero External Cloud Relays</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your imported WhatsApp chat logs are never transmitted to any external server, third-party database, or paid commercial AI API.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Transient Memory by Default</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Raw chat messages are stored only in volatile React memory for the duration of your tab session. Closing the tab or clicking "Clear" immediately purges all data.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>No Unsafe Scraping or Session Theft</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We never prompt you for WhatsApp web session cookies, tokens, or unauthorized headless logins that compromise account security.
          </p>
        </div>
      </div>

      {/* Export and Data Management */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Data Export & Purge Controls
        </h3>

        {analysis ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Active Loaded Conversation:</span>
                <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                  "{analysis.conversationTitle}" ({analysis.stats.totalMessages} messages, {analysis.stats.totalTasks} tasks)
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onExportTxt}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download .txt Briefing</span>
                </button>
                <button
                  onClick={onExportJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-2xs"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Download .json Schema</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClearAll}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear & Purge All Session Data</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No conversation is currently loaded in memory.
          </p>
        )}
      </div>

      {/* WhatsApp Official Limitations FAQ */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-500" />
          <span>Why WhatsApp Export is the Recommended Method</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            <strong>Question: Can an app directly read my private personal WhatsApp group chats via an API?</strong><br />
            <strong>Answer:</strong> No. Meta does not offer a public consumer API that allows third-party web apps to read personal WhatsApp group chats. The WhatsApp Business Platform / Cloud API is designed exclusively for business-to-consumer messaging via registered business phone numbers, webhooks, and explicit business verification.
          </p>
          <p>
            <strong>Question: Why not use a QR code session hijacker or cookie extractor?</strong><br />
            <strong>Answer:</strong> Those methods violate WhatsApp Terms of Service, pose extreme privacy risks (putting full account access in danger of suspension or data theft), and break frequently. The built-in <strong>"Export Chat"</strong> feature provided directly within WhatsApp is secure, officially supported, and keeps full ownership of the conversation in the user's hands.
          </p>
        </div>
      </div>
    </div>
  );
};
