import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Map,
  FileText,
  Bell,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
} from 'recharts';
import { Task, Roadmap, ActivityItem } from '../../types';
import { tasksService } from '../../services/tasks.service';
import { roadmapsService } from '../../services/roadmaps.service';
import { mockStorage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getTimeBasedGreeting, formatDate, isDueToday, isOverdue, formatRelativeTime } from '../../lib/utils';
import { calculateRoadmapProgress } from '../../lib/progress';
import { Button } from '../../components/ui/Button';
import { TaskCard } from '../tasks/TaskCard';
import { TaskFormModal } from '../tasks/TaskFormModal';
import { TaskDetailsModal } from '../tasks/TaskDetailsModal';
import { RoadmapFormModal } from '../roadmaps/RoadmapFormModal';
import { NoteEditorModal } from '../notes/NoteEditorModal';
import { notesService } from '../../services/notes.service';
import { Skeleton } from '../../components/ui/Skeleton';
import { ProgressBar } from '../../components/ui/ProgressBar';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateRoadmapOpen, setIsCreateRoadmapOpen] = useState(false);
  const [isWriteNoteOpen, setIsWriteNoteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const greeting = getTimeBasedGreeting(user?.firstName || 'Alex');

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [tList, rList] = await Promise.all([
        tasksService.getTasks(),
        roadmapsService.getRoadmaps(),
      ]);
      setTasks(tList);
      setRoadmaps(rList);
      setActivities(mockStorage.getActivities());
    } catch {
      error('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Summary Metrics
  const tasksDueToday = useMemo(
    () => tasks.filter(t => isDueToday(t.dueDate) && t.status !== 'completed'),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter(t => t.status === 'completed'),
    [tasks]
  );

  const overdueTasks = useMemo(
    () => tasks.filter(t => isOverdue(t.dueDate, t.status === 'completed')),
    [tasks]
  );

  const upcomingTasks = useMemo(
    () =>
      tasks
        .filter(t => t.status !== 'completed' && !isDueToday(t.dueDate) && !isOverdue(t.dueDate, false))
        .slice(0, 4),
    [tasks]
  );

  const overallProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  }, [tasks, completedTasks]);

  // Mini Sparkline Data
  const sparklineData = [
    { day: 'M', score: 3 },
    { day: 'T', score: 5 },
    { day: 'W', score: 4 },
    { day: 'T', score: 7 },
    { day: 'F', score: 6 },
    { day: 'S', score: 5 },
    { day: 'S', score: 8 },
  ];

  const handleToggleComplete = async (taskId: string) => {
    try {
      const updated = await tasksService.toggleTaskComplete(taskId);
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
      setActivities(mockStorage.getActivities());
      success(updated.status === 'completed' ? 'Task completed!' : 'Task reopened');
    } catch {
      error('Failed to update task.');
    }
  };

  return (
    <div className="space-y-7">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-navy-900 text-white shadow-lg shadow-brand-600/15">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-200">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDateFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting.greeting}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed max-w-xl">
            {greeting.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsCreateTaskOpen(true)}
            leftIcon={<Plus className="w-4 h-4 text-brand-600" />}
            className="bg-white text-slate-900 hover:bg-slate-50 font-semibold shadow-sm"
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Due Today */}
        <div
          onClick={() => navigate('/tasks')}
          className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Due Today
            </span>
            <Clock className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {tasksDueToday.length}
            </span>
            <span className="text-xs text-slate-400">tasks</span>
          </div>
          <span className="text-[11px] text-brand-600 font-medium block mt-1">
            Focus for today's session
          </span>
        </div>

        {/* Tasks Completed */}
        <div
          onClick={() => navigate('/tasks')}
          className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {completedTasks.length}
            </span>
            <span className="text-xs text-slate-400">of {tasks.length}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            {overallProgress}% execution rate
          </span>
        </div>

        {/* Active Roadmaps */}
        <div
          onClick={() => navigate('/roadmaps')}
          className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Roadmaps
            </span>
            <Map className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {roadmaps.length}
            </span>
            <span className="text-xs text-slate-400">growth goals</span>
          </div>
          <span className="text-[11px] text-purple-600 font-medium block mt-1">
            Structured stages active
          </span>
        </div>

        {/* Overdue Alert or Overall Progress */}
        <div
          onClick={() => navigate('/progress')}
          className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Overall Progress
            </span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {overallProgress}%
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar value={overallProgress} size="sm" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Focus & Upcoming Tasks vs. Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Focus & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Warning Alert if any */}
          {overdueTasks.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-xs text-red-800 dark:text-red-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>{overdueTasks.length} task(s) overdue:</strong> Give priority to past due deliverables.
                </span>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="font-bold underline hover:text-red-900 shrink-0"
              >
                View overdue
              </button>
            </div>
          )}

          {/* Today's Focus Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Today's Execution Focus ({tasksDueToday.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Critical tasks with targets due before end of day.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tasks')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                All tasks
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : tasksDueToday.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-navy-800 text-center bg-white dark:bg-navy-900">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  All clear for today!
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                  No tasks due today. Work on your upcoming milestones or growth roadmaps.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreateTaskOpen(true)}
                  leftIcon={<Plus className="w-3 h-3" />}
                >
                  Schedule Task
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasksDueToday.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onClick={setSelectedTask}
                    onEdit={setEditingTask}
                    onDelete={taskId => {
                      tasksService.deleteTask(taskId).then(() => {
                        setTasks(prev => prev.filter(t => t.id !== taskId));
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Tasks Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Upcoming Pipeline
              </h3>
              <span className="text-xs text-slate-400">Next scheduled steps</span>
            </div>

            <div className="space-y-2.5">
              {upcomingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  compact
                  onToggleComplete={handleToggleComplete}
                  onClick={setSelectedTask}
                  onEdit={setEditingTask}
                  onDelete={taskId => {
                    tasksService.deleteTask(taskId).then(() => {
                      setTasks(prev => prev.filter(t => t.id !== taskId));
                    });
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions, Execution Velocity, & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950/60 dark:hover:text-brand-300 border border-slate-200/80 dark:border-navy-700 text-left transition-colors group flex flex-col justify-between h-20"
              >
                <Plus className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Create Task
                </span>
              </button>

              <button
                onClick={() => setIsCreateRoadmapOpen(true)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-navy-700 text-left transition-colors group flex flex-col justify-between h-20"
              >
                <Map className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  New Roadmap
                </span>
              </button>

              <button
                onClick={() => setIsWriteNoteOpen(true)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/60 dark:hover:text-purple-300 border border-slate-200/80 dark:border-navy-700 text-left transition-colors group flex flex-col justify-between h-20"
              >
                <FileText className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Write Note
                </span>
              </button>

              <button
                onClick={() => navigate('/reminders')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/60 dark:hover:text-amber-300 border border-slate-200/80 dark:border-navy-700 text-left transition-colors group flex flex-col justify-between h-20"
              >
                <Bell className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Reminders
                </span>
              </button>
            </div>
          </div>

          {/* Execution Velocity Mini Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Weekly Execution Rhythm
              </span>
              <span className="text-xs font-semibold text-emerald-600">+18% momentum</span>
            </div>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '8px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Completed Units"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#scoreColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Execution Activity
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activities.slice(0, 5).map(act => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-6 h-6 rounded-full bg-brand-50 dark:bg-navy-800 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                    {act.type.includes('task') ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : act.type.includes('roadmap') ? (
                      <Map className="w-3.5 h-3.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {act.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                      {act.description}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {isCreateTaskOpen && (
        <TaskFormModal
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onSubmit={async data => {
            const created = await tasksService.createTask(data);
            setTasks(prev => [created, ...prev]);
            setActivities(mockStorage.getActivities());
            success('Task created successfully!');
          }}
        />
      )}

      {/* Roadmap Creation Modal */}
      {isCreateRoadmapOpen && (
        <RoadmapFormModal
          isOpen={isCreateRoadmapOpen}
          onClose={() => setIsCreateRoadmapOpen(false)}
          onSubmit={async data => {
            const created = await roadmapsService.createRoadmap(data);
            setRoadmaps(prev => [created, ...prev]);
            setActivities(mockStorage.getActivities());
            success('Roadmap created!');
          }}
        />
      )}

      {/* Note Creation Modal */}
      {isWriteNoteOpen && (
        <NoteEditorModal
          isOpen={isWriteNoteOpen}
          onClose={() => setIsWriteNoteOpen(false)}
          onSave={async data => {
            await notesService.createNote(data);
            setActivities(mockStorage.getActivities());
            success('Note saved!');
          }}
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
            tasksService.deleteTask(taskId).then(() => {
              setTasks(prev => prev.filter(t => t.id !== taskId));
              setSelectedTask(null);
            });
          }}
          onToggleComplete={handleToggleComplete}
          onTaskUpdated={updated => {
            setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
            setSelectedTask(updated);
          }}
        />
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <TaskFormModal
          isOpen={Boolean(editingTask)}
          onClose={() => setEditingTask(null)}
          onSubmit={async data => {
            const updated = await tasksService.updateTask(editingTask.id, data);
            setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
            setEditingTask(null);
            success('Task updated!');
          }}
          initialData={editingTask}
        />
      )}
    </div>
  );
};
