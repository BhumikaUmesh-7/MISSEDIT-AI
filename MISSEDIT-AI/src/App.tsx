import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatImport } from './components/ChatImport';
import { MetricCards } from './components/MetricCards';
import { SummaryPanel } from './components/SummaryPanel';
import { PriorityInbox } from './components/PriorityInbox';
import { ActionItems } from './components/ActionItems';
import { DecisionsPanel } from './components/DecisionsPanel';
import { MentionsPanel } from './components/MentionsPanel';
import { DeadlinePanel } from './components/DeadlinePanel';
import { SettingsPrivacy } from './components/SettingsPrivacy';
import { MessageDetailsModal } from './components/MessageDetailsModal';
import { Toast, ToastMessage } from './components/Toast';
import { EmptyState } from './components/EmptyState';
import { analyzeConversation } from './engine/analyzer';
import { DEMO_CONVERSATION_RAW, DEMO_DEFAULT_USER, DEMO_CHAT_TITLE } from './engine/demoData';
import { ActionItem, AnalysisResult, ChatMessage } from './types';

export default function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('import');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [inspectMessage, setInspectMessage] = useState<ChatMessage | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Stored inputs for the import workspace
  const [inputState, setInputState] = useState({
    text: '',
    username: '',
    title: '',
  });

  // Dark mode class toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAnalyze = (rawText: string, username: string, title: string) => {
    try {
      const result = analyzeConversation(rawText, username, title);
      setAnalysis(result);
      setInputState({ text: rawText, username, title: result.conversationTitle });
      setCurrentTab('dashboard');
      addToast(
        'success',
        `Analyzed ${result.stats.userMessages} messages (${result.stats.urgentCount} urgent, ${result.stats.totalTasks} action items)`
      );
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Failed to parse conversation. Please check the text format.');
    }
  };

  const handleLoadDemo = () => {
    setInputState({
      text: DEMO_CONVERSATION_RAW,
      username: DEMO_DEFAULT_USER,
      title: DEMO_CHAT_TITLE,
    });
    const result = analyzeConversation(DEMO_CONVERSATION_RAW, DEMO_DEFAULT_USER, DEMO_CHAT_TITLE);
    setAnalysis(result);
    setCurrentTab('dashboard');
    addToast('success', `Loaded Hackathon Demo Chat ("${DEMO_DEFAULT_USER}" set as active focus)`);
  };

  const handleToggleTask = (taskId: string) => {
    if (!analysis) return;
    const updatedTasks = analysis.actionItems.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: (t.status === 'pending' ? 'completed' : 'pending') as 'pending' | 'completed',
        };
      }
      return t;
    });

    const completed = updatedTasks.filter((t) => t.status === 'completed').length;
    const pending = updatedTasks.length - completed;

    setAnalysis({
      ...analysis,
      actionItems: updatedTasks,
      stats: {
        ...analysis.stats,
        completedTasks: completed,
        pendingTasks: pending,
      },
    });

    const target = updatedTasks.find((t) => t.id === taskId);
    addToast(
      'info',
      target?.status === 'completed' ? 'Task marked as completed' : 'Task reopened'
    );
  };

  const handleEditTask = (updatedTask: ActionItem) => {
    if (!analysis) return;
    const updatedTasks = analysis.actionItems.map((t) =>
      t.id === updatedTask.id ? updatedTask : t
    );
    setAnalysis({
      ...analysis,
      actionItems: updatedTasks,
    });
    addToast('success', 'Task updated successfully');
  };

  const handleDeleteTask = (taskId: string) => {
    if (!analysis) return;
    const updatedTasks = analysis.actionItems.filter((t) => t.id !== taskId);
    const completed = updatedTasks.filter((t) => t.status === 'completed').length;
    const pending = updatedTasks.length - completed;

    setAnalysis({
      ...analysis,
      actionItems: updatedTasks,
      stats: {
        ...analysis.stats,
        totalTasks: updatedTasks.length,
        completedTasks: completed,
        pendingTasks: pending,
      },
    });
    addToast('info', 'Task deleted');
  };

  const handleAddTask = (partial: Partial<ActionItem>) => {
    if (!analysis) return;
    const newTask: ActionItem = {
      id: `task-custom-${Date.now()}`,
      description: partial.description || 'New task',
      assignee: partial.assignee || 'Unassigned',
      assignmentType: partial.assignmentType || 'unclear',
      priority: partial.priority || 'important',
      status: 'pending',
      deadline: partial.deadline || null,
      sourceMessageId: '',
      sender: 'Manual Entry',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceText: 'Added manually by user in MissedIt AI',
    };

    const updatedTasks = [newTask, ...analysis.actionItems];
    const completed = updatedTasks.filter((t) => t.status === 'completed').length;
    const pending = updatedTasks.length - completed;

    setAnalysis({
      ...analysis,
      actionItems: updatedTasks,
      stats: {
        ...analysis.stats,
        totalTasks: updatedTasks.length,
        completedTasks: completed,
        pendingTasks: pending,
      },
    });
    addToast('success', 'Task created');
  };

  const handleCopySummary = () => {
    if (!analysis) return;
    const text = [
      `=== MISSEDIT AI BRIEFING: ${analysis.conversationTitle} ===`,
      `Headline: ${analysis.summary.headline}`,
      `Generated: ${analysis.analyzedAt} | Analyzed: ${analysis.stats.userMessages} messages`,
      '',
      '--- TOP NEXT ACTIONS ---',
      ...analysis.summary.topNextActions.map(
        (a, i) => `${i + 1}. [${a.urgency.toUpperCase()}] ${a.title} (From: ${a.sourceSender})`
      ),
      '',
      '--- CRITICAL DEVELOPMENTS ---',
      ...analysis.summary.criticalDevelopments.map((d) => `• ${d}`),
      '',
      '--- KEY DECISIONS ---',
      ...analysis.summary.topDecisions.map((d) => `• ${d}`),
      '',
      '--- KEY DEADLINES ---',
      ...analysis.summary.keyDeadlines.map((dl) => `• ${dl}`),
    ].join('\n');

    navigator.clipboard
      .writeText(text)
      .then(() => addToast('success', 'Summary briefing copied to clipboard'))
      .catch(() => addToast('error', 'Clipboard permission error'));
  };

  const handleCopyTasks = () => {
    if (!analysis) return;
    const text = [
      `=== ACTION ITEMS: ${analysis.conversationTitle} ===`,
      ...analysis.actionItems.map(
        (t, i) =>
          `${i + 1}. [${t.status === 'completed' ? 'X' : ' '}] ${t.description} (Assignee: ${t.assignee}${
            t.deadline ? `, Due: ${t.deadline}` : ''
          })`
      ),
    ].join('\n');

    navigator.clipboard
      .writeText(text)
      .then(() => addToast('success', 'Action items copied to clipboard'))
      .catch(() => addToast('error', 'Clipboard permission error'));
  };

  const handleCopyDecisions = () => {
    if (!analysis) return;
    const text = [
      `=== KEY DECISIONS: ${analysis.conversationTitle} ===`,
      ...analysis.decisions.map(
        (d, i) => `${i + 1}. ${d.text} (By: ${d.speaker} at ${d.timestamp})`
      ),
    ].join('\n');

    navigator.clipboard
      .writeText(text)
      .then(() => addToast('success', 'Key decisions copied to clipboard'))
      .catch(() => addToast('error', 'Clipboard permission error'));
  };

  const handleExportTxt = () => {
    if (!analysis) return;
    const text = [
      `============================================================`,
      `MISSEDIT AI — CONVERSATION INTELLIGENCE REPORT`,
      `Conversation: ${analysis.conversationTitle}`,
      `Analyzed At: ${new Date().toLocaleString()}`,
      `Focus User: ${analysis.currentUsername || 'None specified'}`,
      `Total Messages: ${analysis.stats.totalMessages} | Speakers: ${analysis.stats.speakers.join(', ')}`,
      `============================================================`,
      '',
      `EXECUTIVE SUMMARY`,
      `${analysis.summary.headline}`,
      '',
      `TOP RECOMMENDED ACTIONS:`,
      ...analysis.summary.topNextActions.map(
        (a, i) => `${i + 1}. [${a.urgency.toUpperCase()}] ${a.title} — ${a.reason}`
      ),
      '',
      `ACTION ITEMS (${analysis.actionItems.length} Total):`,
      ...analysis.actionItems.map(
        (t, i) =>
          `${i + 1}. [${t.status === 'completed' ? 'DONE' : 'PENDING'}] ${t.description} | Owner: ${
            t.assignee
          }${t.deadline ? ` | Deadline: ${t.deadline}` : ''}`
      ),
      '',
      `KEY DECISIONS (${analysis.decisions.length} Total):`,
      ...analysis.decisions.map(
        (d, i) => `${i + 1}. [${d.confidence.toUpperCase()}] ${d.text} (Announced by ${d.speaker})`
      ),
      '',
      `DEADLINES (${analysis.deadlines.length} Total):`,
      ...analysis.deadlines.map((dl, i) => `${i + 1}. ${dl.title} -> ${dl.dateText} (${dl.category})`),
      '',
      `PRIVACY NOTICE:`,
      `This report was generated completely in-browser without sending chat text to any external cloud API.`,
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MissedIt_Report_${analysis.conversationTitle.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Downloaded .txt executive report');
  };

  const handleExportJson = () => {
    if (!analysis) return;
    const jsonStr = JSON.stringify(analysis, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MissedIt_Data_${analysis.conversationTitle.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Downloaded .json schema export');
  };

  const handleClearAll = () => {
    setAnalysis(null);
    setInputState({ text: '', username: '', title: '' });
    setCurrentTab('import');
    setInspectMessage(null);
    addToast('info', 'All conversation and session data cleared');
  };

  const handleOpenMessageById = (msgId: string) => {
    if (!analysis) return;
    const msg = analysis.messages.find((m) => m.id === msgId);
    if (msg) {
      setInspectMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenMobileMenu={() => setMobileSidebarOpen(true)}
        hasAnalyzedData={Boolean(analysis)}
        onLoadDemo={handleLoadDemo}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar & Drawer */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          analysis={analysis}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onClear={handleClearAll}
          onExport={handleExportTxt}
          onLoadDemo={handleLoadDemo}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TAB 1: Import Workspace */}
          {currentTab === 'import' && (
            <ChatImport
              onAnalyze={handleAnalyze}
              onLoadDemo={handleLoadDemo}
              initialText={inputState.text}
              initialUsername={inputState.username}
              initialTitle={inputState.title}
            />
          )}

          {/* TAB 2: Catch-Up Dashboard */}
          {currentTab === 'dashboard' && (
            <>
              {analysis ? (
                <div className="max-w-7xl mx-auto space-y-6">
                  {/* Dynamic Metrics Row */}
                  <MetricCards
                    stats={analysis.stats}
                    onNavigate={(tab) => setCurrentTab(tab)}
                  />

                  {/* Summary & Next Actions Panel */}
                  <SummaryPanel
                    analysis={analysis}
                    onNavigate={(tab) => setCurrentTab(tab)}
                    onCopySummary={handleCopySummary}
                    onExportReport={handleExportTxt}
                    onSelectMessage={handleOpenMessageById}
                    onToggleTask={handleToggleTask}
                  />
                </div>
              ) : (
                <EmptyState
                  title="No conversation analyzed yet"
                  description="Import your WhatsApp chat export (.txt) or load the hackathon demo to view your Catch-Up Dashboard."
                  onImportClick={() => setCurrentTab('import')}
                  onLoadDemo={handleLoadDemo}
                />
              )}
            </>
          )}

          {/* TAB 3: Priority Inbox */}
          {currentTab === 'priority' && (
            <div className="max-w-6xl mx-auto space-y-5">
              {analysis ? (
                <PriorityInbox
                  messages={analysis.messages}
                  onSelectMessage={(msg) => setInspectMessage(msg)}
                  currentUsername={analysis.currentUsername}
                />
              ) : (
                <EmptyState
                  title="Priority Inbox is Empty"
                  description="Import a conversation to classify messages by urgency, action requests, and questions."
                  onImportClick={() => setCurrentTab('import')}
                  onLoadDemo={handleLoadDemo}
                />
              )}
            </div>
          )}

          {/* TAB 4: Action Items */}
          {currentTab === 'tasks' && (
            <div className="max-w-5xl mx-auto space-y-5">
              {analysis ? (
                <ActionItems
                  tasks={analysis.actionItems}
                  onToggleTask={handleToggleTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleAddTask}
                  onCopyTasks={handleCopyTasks}
                  onOpenMessage={handleOpenMessageById}
                  currentUsername={analysis.currentUsername}
                />
              ) : (
                <EmptyState
                  title="No Action Items Detected"
                  description="Import a WhatsApp group chat to extract deliverables, tasks, and ownership."
                  onImportClick={() => setCurrentTab('import')}
                  onLoadDemo={handleLoadDemo}
                />
              )}
            </div>
          )}

          {/* TAB 5: Key Decisions */}
          {currentTab === 'decisions' && (
            <div className="max-w-5xl mx-auto space-y-5">
              {analysis ? (
                <DecisionsPanel
                  decisions={analysis.decisions}
                  onCopyDecisions={handleCopyDecisions}
                  onOpenMessage={handleOpenMessageById}
                />
              ) : (
                <EmptyState
                  title="No Decisions Detected"
                  description="Import a conversation to surface team consensus, approvals, and architecture choices."
                  onImportClick={() => setCurrentTab('import')}
                  onLoadDemo={handleLoadDemo}
                />
              )}
            </div>
          )}

          {/* TAB 6: Mentions & Replies */}
          {currentTab === 'mentions' && (
            <div className="max-w-5xl mx-auto space-y-5">
              {analysis ? (
                <MentionsPanel
                  mentions={analysis.mentions}
                  onOpenMessage={handleOpenMessageById}
                  currentUsername={analysis.currentUsername}
                />
              ) : (
                <EmptyState
                  title="No Mentions Found"
                  description="Import a chat to surface direct @mentions and unanswered questions."
                  onImportClick={() => setCurrentTab('import')}
                  onLoadDemo={handleLoadDemo}
                />
              )}
            </div>
          )}

          {/* TAB 7: Deadline Overview */}
          {currentTab === 'deadlines' && (
            <div className="max-w-5xl mx-auto space-y-5">
              {analysis ? (
                <DeadlinePanel
                  deadlines={analysis.deadlines}
                  onOpenMessage={handleOpenMessageById}
                />
              ) : (
                <EmptyState
                  title="No Deadlines Found"
                  description="Import a chat to extract upcoming milestones, dates, and delivery times."
                  onImportClick={() => setCurrentTab('import')}
                  onLoadDemo={handleLoadDemo}
                />
              )}
            </div>
          )}

          {/* TAB 8: Settings & Privacy */}
          {currentTab === 'privacy' && (
            <SettingsPrivacy
              analysis={analysis}
              onClearAll={handleClearAll}
              onExportJson={handleExportJson}
              onExportTxt={handleExportTxt}
            />
          )}
        </main>
      </div>

      {/* Message Inspection Modal */}
      <MessageDetailsModal
        message={inspectMessage}
        allMessages={analysis?.messages || []}
        onClose={() => setInspectMessage(null)}
        onSelectMessage={(msg) => setInspectMessage(msg)}
      />

      {/* Feedback Toast System */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
