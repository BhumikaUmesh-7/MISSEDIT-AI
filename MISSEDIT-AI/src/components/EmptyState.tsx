import React from 'react';
import { FileUp, Sparkles, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  onImportClick: () => void;
  onLoadDemo: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  onImportClick,
  onLoadDemo,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-xl mx-auto space-y-5 shadow-2xs">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
        <FileUp className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onImportClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs"
        >
          <span>Import WhatsApp Chat</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onLoadDemo}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Load Hackathon Demo</span>
        </button>
      </div>
    </div>
  );
};
