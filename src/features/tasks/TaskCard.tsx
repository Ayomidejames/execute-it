import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Map,
  Sparkles,
  MoreVertical,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Task } from '../../types';
import { getPriorityStyles, formatDate, isOverdue } from '../../lib/utils';
import { calculateTaskProgress, getMilestoneStats } from '../../lib/progress';
import { ProgressBar } from '../../components/ui/ProgressBar';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onClick: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onBreakdownWithAi?: (task: Task) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onClick,
  onEdit,
  onDelete,
  onBreakdownWithAi,
  compact = false,
}) => {
  const priorityStyle = getPriorityStyles(task.priority);
  const overdue = isOverdue(task.dueDate, task.status === 'completed');
  const progress = calculateTaskProgress(task);
  const milestoneStats = getMilestoneStats(task.milestones);
  const isDone = task.status === 'completed';

  return (
    <div
      onClick={() => onClick(task)}
      className={`group relative rounded-xl border bg-white dark:bg-navy-900 transition-all duration-200 cursor-pointer p-4 hover:shadow-card hover:border-slate-300 dark:hover:border-navy-700 ${
        isDone
          ? 'bg-slate-50/60 dark:bg-navy-950/40 border-slate-200 dark:border-navy-800'
          : overdue
          ? 'border-red-200/80 dark:border-red-900/40 bg-red-50/10'
          : 'border-slate-200 dark:border-navy-800'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          className="mt-0.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors shrink-0"
          aria-label={isDone ? 'Mark task as incomplete' : 'Mark task as complete'}
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 hover:stroke-brand-600" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-sm font-semibold tracking-tight truncate ${
                isDone
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors'
              }`}
            >
              {task.title}
            </h4>

            {/* Priority Badge */}
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
            >
              {priorityStyle.label}
            </span>
          </div>

          {!compact && task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Progress bar if milestones exist */}
          {milestoneStats.total > 0 && (
            <div className="pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>
                  {milestoneStats.completed}/{milestoneStats.total} milestones
                </span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} size="sm" />
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Due Date */}
              <div
                className={`flex items-center gap-1 ${
                  overdue ? 'text-red-600 dark:text-red-400 font-semibold' : ''
                }`}
              >
                {overdue ? (
                  <AlertCircle className="w-3 h-3 text-red-600" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span>{formatDate(task.dueDate)}</span>
                {task.dueTime && <span>({task.dueTime})</span>}
              </div>

              {/* Roadmap */}
              {task.roadmapTitle && (
                <div className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Map className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{task.roadmapTitle}</span>
                </div>
              )}
            </div>

            {/* Quick AI Breakdown prompt if 0 milestones and incomplete */}
            {!isDone && milestoneStats.total === 0 && onBreakdownWithAi && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onBreakdownWithAi(task);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium text-[11px]"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Breakdown</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
