import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Map,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Task, Milestone } from '../../types';
import {
  formatDate,
  getPriorityStyles,
  getStatusStyles,
  isOverdue,
} from '../../lib/utils';
import { calculateTaskProgress, getMilestoneStats } from '../../lib/progress';
import { milestonesService } from '../../services/milestones.service';
import { AiTaskBreakdownModal } from '../ai/AiTaskBreakdownModal';
import { useToast } from '../../context/ToastContext';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onTaskUpdated: (updatedTask: Task) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  onTaskUpdated,
}) => {
  const { success, error } = useToast();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  if (!task) return null;

  const priorityStyle = getPriorityStyles(task.priority);
  const statusStyle = getStatusStyles(task.status);
  const overdue = isOverdue(task.dueDate, task.status === 'completed');
  const progress = calculateTaskProgress(task);
  const stats = getMilestoneStats(task.milestones);

  const handleToggleMilestone = async (milestoneId: string) => {
    try {
      const updated = await milestonesService.toggleMilestoneComplete(task.id, milestoneId);
      const updatedMilestones = (task.milestones || []).map(m =>
        m.id === milestoneId ? updated : m
      );
      const updatedTask: Task = {
        ...task,
        milestones: updatedMilestones,
        progress: calculateTaskProgress({ ...task, milestones: updatedMilestones }),
      };
      onTaskUpdated(updatedTask);
      success(updated.isCompleted ? 'Milestone marked complete!' : 'Milestone reopened');
    } catch {
      error('Failed to update milestone.');
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    try {
      setIsAddingMilestone(true);
      const newM = await milestonesService.createMilestone(task.id, {
        title: newMilestoneTitle.trim(),
        isCompleted: false,
        order: (task.milestones?.length || 0) + 1,
      });

      const updatedMilestones = [...(task.milestones || []), newM];
      const updatedTask: Task = {
        ...task,
        milestones: updatedMilestones,
        progress: calculateTaskProgress({ ...task, milestones: updatedMilestones }),
      };
      onTaskUpdated(updatedTask);
      setNewMilestoneTitle('');
      success('Milestone added.');
    } catch {
      error('Failed to add milestone.');
    } finally {
      setIsAddingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await milestonesService.deleteMilestone(task.id, milestoneId);
      const updatedMilestones = (task.milestones || []).filter(m => m.id !== milestoneId);
      const updatedTask: Task = {
        ...task,
        milestones: updatedMilestones,
        progress: calculateTaskProgress({ ...task, milestones: updatedMilestones }),
      };
      onTaskUpdated(updatedTask);
      success('Milestone removed.');
    } catch {
      error('Failed to remove milestone.');
    }
  };

  const handleApplyAiMilestones = async (
    newMilestones: Omit<Milestone, 'id' | 'taskId' | 'createdAt' | 'updatedAt'>[]
  ) => {
    const existing = task.milestones || [];
    const now = new Date().toISOString();
    const created: Milestone[] = newMilestones.map((m, idx) => ({
      ...m,
      id: `ms_${Date.now()}_${idx}`,
      taskId: task.id,
      createdAt: now,
      updatedAt: now,
    }));

    const combined = [...existing, ...created];
    const updatedTask: Task = {
      ...task,
      milestones: combined,
      progress: calculateTaskProgress({ ...task, milestones: combined }),
    };
    onTaskUpdated(updatedTask);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
        <div className="space-y-6">
          {/* Header Actions & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
              >
                {priorityStyle.label} Priority
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.badgeClass}`}
              >
                {statusStyle.label}
              </span>
              {overdue && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Overdue
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(task)}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={() => onDelete(task.id)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Title and Description */}
          <div>
            <div className="flex items-start gap-3">
              <button
                onClick={() => onToggleComplete(task.id)}
                className="mt-1 text-slate-400 hover:text-brand-600 transition-colors"
                title={task.status === 'completed' ? 'Mark Incomplete' : 'Mark Completed'}
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Circle className="w-6 h-6 hover:stroke-brand-600" />
                )}
              </button>
              <div>
                <h2
                  className={`text-xl font-bold text-slate-900 dark:text-white tracking-tight ${
                    task.status === 'completed' ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {task.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {task.description || 'No execution description provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800/50 border border-slate-200 dark:border-navy-700 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Due Date</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                <span>{formatDate(task.dueDate)}</span>
                {task.dueTime && <span className="text-slate-400">({task.dueTime})</span>}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Associated Roadmap</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                <Map className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">{task.roadmapTitle || 'None (Standalone)'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Milestones Completed</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{stats.completed} of {stats.total} ({stats.percent}%)</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {task.tags.map(tag => (
                <Badge key={tag} variant="outline" size="sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Milestones Section */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-navy-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Milestones & Actionable Steps ({stats.completed}/{stats.total})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Step-by-step deliverables required to execute this task.
                </p>
              </div>

              {/* Break down with AI trigger button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAiModalOpen(true)}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />}
                className="border-brand-200 hover:bg-brand-50 text-brand-700 dark:border-brand-900 dark:text-brand-300"
              >
                Break down with AI
              </Button>
            </div>

            {/* Progress Bar */}
            <ProgressBar value={progress} showLabel size="md" />

            {/* Milestones List */}
            <div className="space-y-2">
              {task.milestones && task.milestones.length > 0 ? (
                task.milestones.map((m, index) => (
                  <div
                    key={m.id}
                    className={`flex items-start justify-between p-3 rounded-lg border transition-all ${
                      m.isCompleted
                        ? 'bg-slate-50/70 dark:bg-navy-950/40 border-slate-200 dark:border-navy-800 opacity-70'
                        : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleMilestone(m.id)}
                        className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        {m.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div>
                        <span
                          className={`text-xs font-semibold text-slate-900 dark:text-slate-100 ${
                            m.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          Step {index + 1}: {m.title}
                        </span>
                        {m.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {m.description}
                          </p>
                        )}
                        {m.estimatedHours && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> ~{m.estimatedHours}h
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors ml-2"
                      title="Delete milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center border border-dashed rounded-lg text-xs text-slate-400">
                  No milestones added yet. Click "Break down with AI" or add a step manually below.
                </div>
              )}
            </div>

            {/* Quick manual milestone add form */}
            <form onSubmit={handleAddMilestone} className="flex gap-2">
              <input
                type="text"
                placeholder="Add manual milestone step..."
                value={newMilestoneTitle}
                onChange={e => setNewMilestoneTitle(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={!newMilestoneTitle.trim() || isAddingMilestone}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add
              </Button>
            </form>
          </div>
        </div>
      </Modal>

      {/* AI Breakdown Modal */}
      {isAiModalOpen && (
        <AiTaskBreakdownModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          task={task}
          onApplyMilestones={handleApplyAiMilestones}
        />
      )}
    </>
  );
};
