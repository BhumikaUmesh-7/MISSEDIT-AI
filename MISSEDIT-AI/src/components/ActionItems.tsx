import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Copy,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  User,
  Filter,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { ActionItem, PriorityLevel } from '../types';

interface ActionItemsProps {
  tasks: ActionItem[];
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: ActionItem) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Partial<ActionItem>) => void;
  onCopyTasks: () => void;
  onOpenMessage: (messageId: string) => void;
  currentUsername?: string;
}

export const ActionItems: React.FC<ActionItemsProps> = ({
  tasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onCopyTasks,
  onOpenMessage,
  currentUsername = '',
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'me' | 'others' | 'unclear'>('all');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editPriority, setEditPriority] = useState<PriorityLevel>('important');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState(currentUsername || 'Team');

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.length - completedCount;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'pending' && t.status !== 'pending') return false;
    if (statusFilter === 'completed' && t.status !== 'completed') return false;

    if (assigneeFilter === 'me' && t.assignmentType !== 'assigned_to_me') return false;
    if (assigneeFilter === 'others' && t.assignmentType !== 'assigned_to_someone_else') return false;
    if (assigneeFilter === 'unclear' && t.assignmentType !== 'unclear') return false;

    return true;
  });

  const startEdit = (task: ActionItem) => {
    setEditingTaskId(task.id);
    setEditDesc(task.description);
    setEditAssignee(task.assignee);
    setEditPriority(task.priority);
  };

  const saveEdit = (task: ActionItem) => {
    onEditTask({
      ...task,
      description: editDesc.trim() || task.description,
      assignee: editAssignee.trim() || task.assignee,
      priority: editPriority,
    });
    setEditingTaskId(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    onAddTask({
      description: newDesc.trim(),
      assignee: newAssignee.trim() || 'Unassigned',
      priority: 'important',
      status: 'pending',
      assignmentType:
        currentUsername && newAssignee.toLowerCase() === currentUsername.toLowerCase()
          ? 'assigned_to_me'
          : 'assigned_to_someone_else',
    });
    setNewDesc('');
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-5">
      {/* Header with Progress Bar and Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Extracted Action Items & Deliverables</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {pendingCount} remaining · {completedCount} completed · {progressPercent}% resolution rate
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Task</span>
            </button>
            <button
              onClick={onCopyTasks}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Tasks</span>
            </button>
          </div>
        </div>

        {/* Real Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                statusFilter === 'pending' ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                statusFilter === 'completed' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Assignee Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setAssigneeFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                assigneeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Assignees
            </button>
            <button
              onClick={() => setAssigneeFilter('me')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                assigneeFilter === 'me' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Assigned to Me
            </button>
            <button
              onClick={() => setAssigneeFilter('others')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                assigneeFilter === 'others' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Others
            </button>
          </div>
        </div>
      </div>

      {/* Inline New Task Creator */}
      {isAddingNew && (
        <form onSubmit={handleCreateNew} className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-3">
          <div className="font-semibold text-xs text-indigo-900 dark:text-indigo-300">New Action Item</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Task description..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="sm:col-span-2 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Assignee..."
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Task Cards List */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
          No action items match the selected filter.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const isCompleted = task.status === 'completed';

            if (isEditing) {
              return (
                <div key={task.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-indigo-400 dark:border-indigo-600 space-y-3">
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      placeholder="Assignee"
                      className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    />
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
                      className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="important">Important</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(task)}
                        className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-65'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Complete / Checkbox Button */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                    aria-label={isCompleted ? 'Reopen task' : 'Mark task complete'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.description}
                      </span>

                      {/* Assignment & Priority Badges */}
                      <div className="flex items-center gap-2">
                        {task.assignmentType === 'assigned_to_me' && (
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 px-2 py-0.5 rounded">
                            Assigned to You
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            task.priority === 'urgent'
                              ? 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Metadata line: Assignee, Deadline, Sender */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{task.assignee}</strong></span>
                      </span>

                      {task.deadline && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{task.deadline}</span>
                        </span>
                      )}

                      <span>·</span>

                      <span>Origin: {task.sender}</span>
                    </div>

                    {/* Source context quote */}
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="truncate italic font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        "{task.sourceText.slice(0, 90)}{task.sourceText.length > 90 ? '...' : ''}"
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {task.sourceMessageId && (
                          <button
                            onClick={() => onOpenMessage(task.sourceMessageId)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <span>View Source</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(task)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
