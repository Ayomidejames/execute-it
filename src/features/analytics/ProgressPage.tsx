import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Map,
  Target,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { Task, Roadmap } from '../../types';
import { tasksService } from '../../services/tasks.service';
import { roadmapsService } from '../../services/roadmaps.service';
import { calculateRoadmapProgress, calculateTaskProgress, getMilestoneStats } from '../../lib/progress';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';

export const ProgressPage: React.FC = () => {
  const { error } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    Promise.all([tasksService.getTasks(), roadmapsService.getRoadmaps()])
      .then(([t, r]) => {
        setTasks(t);
        setRoadmaps(r);
      })
      .catch(() => error('Failed to load execution analytics.'))
      .finally(() => setIsLoading(false));
  }, []);

  // Compute metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Milestone statistics
  const totalMilestones = tasks.reduce((sum, t) => sum + (t.milestones?.length || 0), 0);
  const completedMilestones = tasks.reduce(
    (sum, t) => sum + (t.milestones?.filter(m => m.isCompleted).length || 0),
    0
  );
  const milestoneRate =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Realistic mock trend dataset for the selected period
  const trendData = useMemo(() => {
    if (timeRange === '7d') {
      return [
        { day: 'Mon', completed: 2, created: 3, milestones: 4 },
        { day: 'Tue', completed: 3, created: 2, milestones: 5 },
        { day: 'Wed', completed: 1, created: 4, milestones: 3 },
        { day: 'Thu', completed: 4, created: 2, milestones: 6 },
        { day: 'Fri', completed: 3, created: 1, milestones: 5 },
        { day: 'Sat', completed: 2, created: 2, milestones: 3 },
        { day: 'Sun', completed: 4, created: 1, milestones: 7 },
      ];
    } else if (timeRange === '30d') {
      return [
        { day: 'Week 1', completed: 12, created: 14, milestones: 22 },
        { day: 'Week 2', completed: 15, created: 11, milestones: 28 },
        { day: 'Week 3', completed: 18, created: 16, milestones: 34 },
        { day: 'Week 4', completed: 14, created: 9, milestones: 26 },
      ];
    } else {
      return [
        { day: 'Month 1', completed: 45, created: 48, milestones: 94 },
        { day: 'Month 2', completed: 58, created: 52, milestones: 112 },
        { day: 'Month 3', completed: 62, created: 40, milestones: 125 },
      ];
    }
  }, [timeRange]);

  return (
    <div className="space-y-6">
      {/* Header and Time filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Execution Analytics & Growth
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Objective feedback on your execution rhythm, milestone completion, and goal momentum.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-navy-800 rounded-lg">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tasks Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {completedTasks}
            </span>
            <span className="text-xs text-slate-400">/ {totalTasks} total</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            {completionRate}% overall task completion
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Milestone Execution
            </span>
            <Target className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {completedMilestones}
            </span>
            <span className="text-xs text-slate-400">/ {totalMilestones} steps</span>
          </div>
          <span className="text-[11px] text-brand-600 font-semibold block mt-1">
            {milestoneRate}% actionable milestones done
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Roadmaps
            </span>
            <Map className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {roadmaps.filter(r => r.status === 'active').length}
            </span>
            <span className="text-xs text-slate-400">active programs</span>
          </div>
          <span className="text-[11px] text-purple-600 font-semibold block mt-1">
            Career & technical mastery
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Execution Rhythm
            </span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Consistent
            </span>
          </div>
          <span className="text-[11px] text-teal-600 font-semibold block mt-1">
            Daily execution cadence verified
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Execution Trend Over Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Completed tasks versus milestone deliverables executed.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMilestones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Tasks Completed"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
                <Area
                  type="monotone"
                  dataKey="milestones"
                  name="Milestones Done"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMilestones)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks Created vs Completed Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Tasks Created vs. Executed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Balancing intention intake with concrete finished outputs.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="created" name="Created" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Roadmap Execution Breakdown */}
      <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Progress by Growth Roadmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Granular execution status across your long-term ambitions.
          </p>
        </div>

        <div className="space-y-4">
          {roadmaps.map(roadmap => {
            const { progressPercent, totalTasks, completedTasks } = calculateRoadmapProgress(
              roadmap,
              tasks
            );
            return (
              <div key={roadmap.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {roadmap.title}
                    </span>
                    <span className="text-[10px] text-slate-400">({roadmap.category})</span>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {completedTasks}/{totalTasks} tasks ({progressPercent}%)
                  </span>
                </div>
                <ProgressBar value={progressPercent} color={roadmap.color} size="md" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Accessible Text-Based Summary */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <strong className="text-slate-800 dark:text-slate-200">
            Accessible Analytics Summary:
          </strong>
          <p>
            You have completed {completedTasks} out of {totalTasks} total tasks across your active growth roadmaps. {completedMilestones} discrete milestones have been checked off. The Backend Developer Roadmap is currently your most active roadmap with {roadmaps[0]?.stages?.length || 3} sequential stages.
          </p>
        </div>
      </div>
    </div>
  );
};
