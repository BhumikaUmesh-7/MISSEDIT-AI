import React from 'react';
import {
  FileText,
  LayoutDashboard,
  Inbox,
  CheckSquare,
  Scale,
  AtSign,
  Calendar,
  ShieldCheck,
  X,
  Trash2,
  Download,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  analysis: AnalysisResult | null;
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  onExport: () => void;
  onLoadDemo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  analysis,
  isOpen,
  onClose,
  onClear,
  onExport,
  onLoadDemo,
}) => {
  const hasData = Boolean(analysis);

  const navItems = [
    {
      id: 'import',
      label: 'Home / Import',
      icon: FileText,
      badge: null,
      enabled: true,
    },
    {
      id: 'dashboard',
      label: 'Catch-Up Dashboard',
      icon: LayoutDashboard,
      badge: hasData ? `${analysis?.messages.length || 0} msgs` : null,
      enabled: hasData,
    },
    {
      id: 'priority',
      label: 'Priority Inbox',
      icon: Inbox,
      badge: hasData && analysis?.stats.urgentCount ? `${analysis.stats.urgentCount} urgent` : null,
      badgeColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400',
      enabled: hasData,
    },
    {
      id: 'tasks',
      label: 'Action Items',
      icon: CheckSquare,
      badge: hasData ? `${analysis?.actionItems.filter(t => t.status === 'pending').length} left` : null,
      badgeColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400',
      enabled: hasData,
    },
    {
      id: 'decisions',
      label: 'Key Decisions',
      icon: Scale,
      badge: hasData && analysis?.decisions.length ? `${analysis.decisions.length}` : null,
      enabled: hasData,
    },
    {
      id: 'mentions',
      label: 'Mentions & Replies',
      icon: AtSign,
      badge: hasData && analysis?.mentions.length ? `${analysis.mentions.length}` : null,
      enabled: hasData,
    },
    {
      id: 'deadlines',
      label: 'Deadline Overview',
      icon: Calendar,
      badge: hasData && analysis?.deadlines.length ? `${analysis.deadlines.length}` : null,
      enabled: hasData,
    },
    {
      id: 'privacy',
      label: 'Settings & Privacy',
      icon: ShieldCheck,
      badge: null,
      enabled: true,
    },
  ];

  const handleSelect = (id: string, enabled: boolean) => {
    if (!enabled) return;
    onTabChange(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header on mobile */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 lg:hidden">
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Navigation</span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Conversation Pill Card (if loaded) */}
        {analysis ? (
          <div className="p-4 mx-3 mt-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Active Chat
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate" title={analysis.conversationTitle}>
              {analysis.conversationTitle}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{analysis.stats.speakers.length} speakers</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{analysis.stats.totalMessages} msgs</span>
              </span>
            </div>
            {analysis.currentUsername && (
              <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                Focus User: @{analysis.currentUsername}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 mx-3 mt-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
              No Chat Loaded
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Import a WhatsApp export or run a demo to see full insights.
            </p>
            <button
              onClick={onLoadDemo}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Hackathon Demo</span>
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id, item.enabled)}
                disabled={!item.enabled}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : item.enabled
                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                    : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-mono shrink-0 ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : item.badgeColor || 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions if Chat Loaded */}
        {analysis && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              onClick={onExport}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
            <button
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Conversation</span>
            </button>
          </div>
        )}

        {/* Security badge footer */}
        <div className="p-3 text-[11px] text-slate-400 dark:text-slate-500 text-center border-t border-slate-100 dark:border-slate-900">
          In-Browser Sandbox · 0 Cloud Relays
        </div>
      </aside>
    </>
  );
};
