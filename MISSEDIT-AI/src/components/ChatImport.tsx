import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Info,
  Check,
  ArrowRight,
  Eye,
  Trash2,
} from 'lucide-react';
import { parseWhatsAppChat } from '../engine/whatsappParser';
import { ChatMessage } from '../types';

interface ChatImportProps {
  onAnalyze: (rawText: string, username: string, title: string) => void;
  onLoadDemo: () => void;
  initialText?: string;
  initialUsername?: string;
  initialTitle?: string;
}

export const ChatImport: React.FC<ChatImportProps> = ({
  onAnalyze,
  onLoadDemo,
  initialText = '',
  initialUsername = '',
  initialTitle = '',
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [userName, setUserName] = useState(initialUsername);
  const [chatTitle, setChatTitle] = useState(initialTitle);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'how-to'>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewMessages, setPreviewMessages] = useState<ChatMessage[]>([]);
  const [detectedSpeakers, setDetectedSpeakers] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if initialText changes (e.g., when demo loaded from elsewhere)
  React.useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      const parsed = parseWhatsAppChat(initialText, initialTitle || 'WhatsApp Chat');
      setPreviewMessages(parsed.messages.slice(0, 8));
      setDetectedSpeakers(parsed.detectedSpeakers);
      if (initialTitle) setChatTitle(initialTitle);
      if (initialUsername) setUserName(initialUsername);
    }
  }, [initialText, initialTitle, initialUsername]);

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    if (!file.name.endsWith('.txt')) {
      setErrorMsg('Please select a valid WhatsApp exported text file (.txt).');
      return;
    }

    if (file.size === 0) {
      setErrorMsg('The selected file is empty.');
      return;
    }

    setFileName(file.name);
    const derivedTitle = file.name.replace(/^WhatsApp Chat - /i, '').replace(/\.txt$/i, '');
    setChatTitle(derivedTitle);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content || !content.trim()) {
        setErrorMsg('The selected text file contains no readable content.');
        return;
      }

      setInputText(content);
      const parsed = parseWhatsAppChat(content, derivedTitle);
      setPreviewMessages(parsed.messages.slice(0, 8));
      setDetectedSpeakers(parsed.detectedSpeakers);

      if (parsed.detectedSpeakers.length > 0 && !userName) {
        // Leave placeholder or prompt user
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the file. Please try pasting the text manually.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleManualTextChange = (text: string) => {
    setInputText(text);
    setErrorMsg(null);
    if (text.trim().length > 20) {
      const parsed = parseWhatsAppChat(text, chatTitle || 'Pasted Conversation');
      setPreviewMessages(parsed.messages.slice(0, 8));
      setDetectedSpeakers(parsed.detectedSpeakers);
    } else {
      setPreviewMessages([]);
      setDetectedSpeakers([]);
    }
  };

  const handleTriggerAnalyze = () => {
    if (!inputText.trim()) {
      setErrorMsg('Please import a .txt file or paste conversation messages to analyze.');
      return;
    }
    onAnalyze(inputText, userName, chatTitle || fileName || 'Imported WhatsApp Chat');
  };

  const handleClearCurrent = () => {
    setInputText('');
    setFileName(null);
    setPreviewMessages([]);
    setDetectedSpeakers([]);
    setChatTitle('');
    setErrorMsg(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Hero Intro */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>100% Private · Parsed Entirely in Your Browser</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ textWrap: 'balance' }}>
          Catch up in minutes. Miss nothing important.
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto" style={{ textWrap: 'balance' }}>
          Turn hundreds of unread WhatsApp group messages into a structured executive briefing, urgent priority inbox, assigned action items, decisions, and deadlines.
        </p>
      </div>

      {/* Main Import Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t border-x border-slate-200 dark:border-slate-800 -mb-px'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Option A: Import Export (.txt)</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all ${
              activeTab === 'paste'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t border-x border-slate-200 dark:border-slate-800 -mb-px'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Text Fallback</span>
          </button>
          <button
            onClick={() => setActiveTab('how-to')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all ${
              activeTab === 'how-to'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t border-x border-slate-200 dark:border-slate-800 -mb-px'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>How to Export & WhatsApp Web</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: File Upload / Drag & Drop */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  {fileName ? (
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{fileName}</span>
                  ) : (
                    'Click to select or drag & drop exported WhatsApp .txt file'
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  Supports standard WhatsApp exports with timestamps (12h/24h, iOS, Android, web brackets, hyphen formats). Zero media required.
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                  >
                    Select .txt File
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadDemo();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Try Sample Chat</span>
                  </button>
                </div>
              </div>

              {/* Direct connection explanation note (Option B requirements) */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">WhatsApp Integration Architecture: </span>
                  WhatsApp protects personal chat logs with end-to-end encryption. Official Meta APIs (Cloud API / Business Platform) only support verified commercial accounts and registered webhooks—they do not allow external web apps to passively read private personal user group chats. Exporting chats as a <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">.txt</code> file is the <strong>official, secure, and privacy-preserving method</strong> to bring conversations into MissedIt AI without risking credentials or violating terms of service.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Paste Text Fallback */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Paste WhatsApp Conversation Text
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => handleManualTextChange(e.target.value)}
                  placeholder="Paste your exported or copied WhatsApp chat messages here..."
                  rows={8}
                  className="w-full p-3.5 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 leading-relaxed"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>{inputText.length.toLocaleString()} characters</span>
                <span>{inputText.split('\n').filter(Boolean).length} lines</span>
              </div>
            </div>
          )}

          {/* TAB 3: How to Export Guide & Open WhatsApp Web */}
          {activeTab === 'how-to' && (
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono">1</span>
                    Export from WhatsApp (Mobile)
                  </h3>
                  <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Open WhatsApp and open your target group or chat.</li>
                    <li>Tap the <strong>Group Info</strong> or <strong>Three Dots (⋮)</strong> menu.</li>
                    <li>Select <strong>More</strong> → <strong>Export Chat</strong>.</li>
                    <li>Choose <strong>Without Media</strong> (ensures fast export).</li>
                    <li>Save the resulting <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">.txt</code> file to your device or Google Drive.</li>
                    <li>Return here and upload it!</li>
                  </ol>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono">2</span>
                    Open WhatsApp Web / Desktop
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    You can launch WhatsApp Web directly to verify or copy recent messages if you are on a computer. Note that WhatsApp Web does not grant external apps automated access to your messages.
                  </p>
                  <a
                    href="https://web.whatsapp.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
                  >
                    <span>Launch WhatsApp Web</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* User Parameters (Name & Title) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Name / WhatsApp Handle (Optional)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Alex or Rohan (for mention and task detection)"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Used to highlight tasks assigned directly to you and direct @mentions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Conversation Label
              </label>
              <input
                type="text"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder="e.g. Hackathon Team Sync"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Custom name for your report and export headers.
              </p>
            </div>
          </div>

          {/* PREVIEW OF IMPORTED MESSAGES (if text loaded) */}
          {previewMessages.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Import Preview ({detectedSpeakers.length} Speakers Detected)
                  </span>
                </div>
                <button
                  onClick={handleClearCurrent}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Chat</span>
                </button>
              </div>

              {/* Detected Speakers Badges */}
              {detectedSpeakers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-500 self-center mr-1">Speakers:</span>
                  {detectedSpeakers.map((spk) => (
                    <button
                      key={spk}
                      type="button"
                      onClick={() => setUserName(spk)}
                      title={`Click to set your username to ${spk}`}
                      className={`px-2 py-0.5 rounded text-xs transition-colors ${
                        userName.toLowerCase() === spk.toLowerCase()
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {spk}
                    </button>
                  ))}
                </div>
              )}

              {/* Message preview list */}
              <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-3 space-y-2 text-xs font-mono">
                {previewMessages.map((m, idx) => (
                  <div key={m.id || idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 shrink-0 text-[11px]">{m.timestamp}:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">{m.sender}:</span>
                    <span className="truncate">{m.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {inputText.trim() ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-4 h-4" />
                  Ready to analyze {inputText.split('\n').filter(Boolean).length} messages
                </span>
              ) : (
                <span>No conversation loaded yet</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onLoadDemo}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Load Sample</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerAnalyze}
                disabled={!inputText.trim()}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all whitespace-nowrap"
              >
                <span>Analyze Conversation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
