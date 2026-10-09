import React from 'react';
import { Menu, MessageSquareShare, Sparkles, Shield, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenMobileMenu: () => void;
  hasAnalyzedData: boolean;
  onLoadDemo: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenMobileMenu,
  hasAnalyzedData,
  onLoadDemo,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Brand wordmark & mobile toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('import');
          }}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 group"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
            <MessageSquareShare className="w-4 h-4" />
          </div>
          <span>MissedIt AI</span>
        </a>
      </div>

      {/* Zone 2: Navigation Links (Desktop) */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => onTabChange('import')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'import' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
          }`}
        >
          Import Chat
        </button>
        <button
          onClick={() => onTabChange('dashboard')}
          disabled={!hasAnalyzedData}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
            currentTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
          }`}
        >
          Catch-Up
        </button>
        <button
          onClick={() => onTabChange('priority')}
          disabled={!hasAnalyzedData}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
            currentTab === 'priority' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
          }`}
        >
          Priority Inbox
        </button>
        <button
          onClick={() => onTabChange('tasks')}
          disabled={!hasAnalyzedData}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
            currentTab === 'tasks' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
          }`}
        >
          Action Items
        </button>
        <button
          onClick={() => onTabChange('decisions')}
          disabled={!hasAnalyzedData}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
            currentTab === 'decisions' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
          }`}
        >
          Decisions
        </button>
        <button
          onClick={() => onTabChange('deadlines')}
          disabled={!hasAnalyzedData}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
            currentTab === 'deadlines' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
          }`}
        >
          Deadlines
        </button>
      </nav>

      {/* Zone 3: Primary action + privacy & dark mode */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="whitespace-nowrap">Local Processing Only</span>
        </div>

        {!hasAnalyzedData ? (
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Chat</span>
          </button>
        ) : (
          <button
            onClick={() => onTabChange('import')}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors whitespace-nowrap"
          >
            Import Another
          </button>
        )}
      </div>
    </header>
  );
};
