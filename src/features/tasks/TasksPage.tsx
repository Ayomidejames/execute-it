import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  ListFilter,
  LayoutGrid,
  List,
  AlertCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../../types';
import { tasksService } from '../../services/tasks.service';
import { TaskCard } from './TaskCard';
import { TaskFormModal } from './TaskFormModal';
import { TaskDetailsModal } from './TaskDetailsModal';
import { ConfirmModal } from '../../components/feedback/ConfirmModal';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import { isDueToday, isOverdue } from '../../lib/utils';
import { AiTaskBreakdownModal } from '../ai/AiTaskBreakdownModal';

export const TasksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [aiBreakdownTask, setAiBreakdownTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await tasksService.getTasks();
      setTasks(data);

      // Check if taskId query param was passed to auto-open details
      const qTaskId = searchParams.get('taskId');
      if (qTaskId) {
        const found = data.find(t => t.id === qTaskId);
        if (found) setSelectedTask(found);
      }
    } catch {
      error('Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Tab filter
      const isDone = t.status === 'completed';
      const overdue = isOverdue(t.dueDate, isDone);
      const dueToday = isDueToday(t.dueDate);

      if (activeTab === 'today' && (!dueToday || isDone)) return false;
      if (activeTab === 'completed' && !isDone) return false;
      if (activeTab === 'overdue' && (!overdue || isDone)) return false;
      if (activeTab === 'upcoming' && (isDone || dueToday || overdue)) return false;

      // Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesTags = t.tags?.some(tag => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityWeight: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, activeTab, priorityFilter, searchQuery, sortBy]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const todayCount = tasks.filter(t => isDueToday(t.dueDate) && t.status !== 'completed').length;
    const overdueCount = tasks.filter(t => isOverdue(t.dueDate, t.status === 'completed')).length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const upcomingCount = tasks.filter(
      t => t.status !== 'completed' && !isDueToday(t.dueDate) && !isOverdue(t.dueDate, false)
    ).length;

    return {
      all: tasks.length,
      today: todayCount,
      upcoming: upcomingCount,
      overdue: overdueCount,
      completed: completedCount,
    };
  }, [tasks]);

  const handleToggleComplete = async (taskId: string) => {
    try {
      const updated = await tasksService.toggleTaskComplete(taskId);
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
      success(updated.status === 'completed' ? 'Task completed!' : 'Task reopened');
    } catch {
      error('Failed to update task.');
    }
  };

  const handleCreateTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => {
    try {
      const created = await tasksService.createTask(data);
      setTasks(prev => [created, ...prev]);
      success('Task created successfully!');
    } catch {
      error('Failed to create task.');
    }
  };

  const handleUpdateTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => {
    if (!editingTask) return;
    try {
      const updated = await tasksService.updateTask(editingTask.id, data);
      setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      if (selectedTask?.id === updated.id) setSelectedTask(updated);
      setEditingTask(null);
      success('Task updated successfully!');
    } catch {
      error('Failed to update task.');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;
    try {
      await tasksService.deleteTask(deletingTaskId);
      setTasks(prev => prev.filter(t => t.id !== deletingTaskId));
      if (selectedTask?.id === deletingTaskId) setSelectedTask(null);
      setDeletingTaskId(null);
      success('Task deleted.');
    } catch {
      error('Failed to delete task.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Tabs and View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Tasks', count: tabCounts.all },
            { id: 'today', label: 'Due Today', count: tabCounts.today },
            { id: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming },
            { id: 'overdue', label: 'Overdue', count: tabCounts.overdue },
            { id: 'completed', label: 'Completed', count: tabCounts.completed },
          ]}
          activeTab={activeTab}
          onChange={id => setActiveTab(id as any)}
        />

        <div className="flex items-center gap-2">
          {/* List vs Board view switch */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-navy-800 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-navy-900 text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-navy-900 text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 shadow-subtle">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter tasks by title, description, or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-800/60 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">Priority:</span>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-navy-800/60 rounded-lg border border-slate-200 dark:border-navy-700 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-50 dark:bg-navy-800/60 rounded-lg border border-slate-200 dark:border-navy-700 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Creation Date</option>
          </select>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(n => (
            <Skeleton key={n} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTasks.length === 0 && (
        <EmptyState
          icon={<CheckSquare className="w-6 h-6 text-brand-600" />}
          title={
            searchQuery
              ? 'No matching tasks'
              : activeTab === 'completed'
              ? 'No completed tasks yet'
              : activeTab === 'today'
              ? 'No tasks due today'
              : activeTab === 'overdue'
              ? 'No overdue tasks!'
              : 'No tasks scheduled'
          }
          description={
            searchQuery
              ? 'Try adjusting your search query or clear priority filters.'
              : 'Create a new task to turn your goals into clear execution steps.'
          }
          actionLabel="Create Task"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* List View */}
      {!isLoading && filteredTasks.length > 0 && viewMode === 'list' && (
        <div className="space-y-2.5">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onClick={setSelectedTask}
              onEdit={setEditingTask}
              onDelete={setDeletingTaskId}
              onBreakdownWithAi={setAiBreakdownTask}
            />
          ))}
        </div>
      )}

      {/* Board / Kanban View */}
      {!isLoading && filteredTasks.length > 0 && viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column: To Do */}
          <div className="bg-slate-100/70 dark:bg-navy-900/40 rounded-xl p-3 border border-slate-200 dark:border-navy-800 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                To Do
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 font-semibold">
                {filteredTasks.filter(t => t.status === 'todo').length}
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks
                .filter(t => t.status === 'todo')
                .map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    compact
                    onToggleComplete={handleToggleComplete}
                    onClick={setSelectedTask}
                    onEdit={setEditingTask}
                    onDelete={setDeletingTaskId}
                  />
                ))}
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="bg-slate-100/70 dark:bg-navy-900/40 rounded-xl p-3 border border-slate-200 dark:border-navy-800 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                In Progress
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 font-semibold text-blue-700">
                {filteredTasks.filter(t => t.status === 'in_progress').length}
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks
                .filter(t => t.status === 'in_progress')
                .map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    compact
                    onToggleComplete={handleToggleComplete}
                    onClick={setSelectedTask}
                    onEdit={setEditingTask}
                    onDelete={setDeletingTaskId}
                  />
                ))}
            </div>
          </div>

          {/* Column: Completed */}
          <div className="bg-slate-100/70 dark:bg-navy-900/40 rounded-xl p-3 border border-slate-200 dark:border-navy-800 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Completed
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 font-semibold text-emerald-700">
                {filteredTasks.filter(t => t.status === 'completed').length}
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks
                .filter(t => t.status === 'completed')
                .map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    compact
                    onToggleComplete={handleToggleComplete}
                    onClick={setSelectedTask}
                    onEdit={setEditingTask}
                    onDelete={setDeletingTaskId}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {isCreateModalOpen && (
        <TaskFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <TaskFormModal
          isOpen={Boolean(editingTask)}
          onClose={() => setEditingTask(null)}
          onSubmit={handleUpdateTask}
          initialData={editingTask}
        />
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onEdit={task => {
            setSelectedTask(null);
            setEditingTask(task);
          }}
          onDelete={taskId => {
            setSelectedTask(null);
            setDeletingTaskId(taskId);
          }}
          onToggleComplete={handleToggleComplete}
          onTaskUpdated={updatedTask => {
            setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
            setSelectedTask(updatedTask);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingTaskId && (
        <ConfirmModal
          isOpen={Boolean(deletingTaskId)}
          onClose={() => setDeletingTaskId(null)}
          onConfirm={handleDeleteTask}
          title="Delete Task"
          description="Are you sure you want to delete this task? All associated milestones will also be removed."
        />
      )}

      {/* AI Breakdown Modal from Card trigger */}
      {aiBreakdownTask && (
        <AiTaskBreakdownModal
          isOpen={Boolean(aiBreakdownTask)}
          onClose={() => setAiBreakdownTask(null)}
          task={aiBreakdownTask}
          onApplyMilestones={async newMilestones => {
            await tasksService.addMilestonesToTask(aiBreakdownTask.id, newMilestones);
            fetchTasks();
            setAiBreakdownTask(null);
          }}
        />
      )}
    </div>
  );
};
