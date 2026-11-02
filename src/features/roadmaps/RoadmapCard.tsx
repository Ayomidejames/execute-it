import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { Roadmap, Task } from '../../types';
import { calculateRoadmapProgress } from '../../lib/progress';
import { formatDate } from '../../lib/utils';
import { ProgressBar } from '../../components/ui/ProgressBar';

interface RoadmapCardProps {
  roadmap: Roadmap;
  allTasks: Task[];
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({ roadmap, allTasks }) => {
  const navigate = useNavigate();
  const { progressPercent, totalTasks, completedTasks } = calculateRoadmapProgress(
    roadmap,
    allTasks
  );

  const categoryColors: Record<string, string> = {
    Career: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Technical: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    Personal: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    Health: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Education: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Projects: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  };

  const badgeClass = categoryColors[roadmap.category] || categoryColors.Career;

  return (
    <div
      onClick={() => navigate(`/roadmaps/${roadmap.id}`)}
      className="group relative rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5 shadow-subtle hover:shadow-card hover:border-slate-300 dark:hover:border-navy-700 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top bar: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClass}`}>
            {roadmap.category}
          </span>
          <span className="text-xs font-semibold capitalize text-slate-400">
            {roadmap.status}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {roadmap.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {roadmap.description}
        </p>
      </div>

      {/* Progress & Metadata */}
      <div className="mt-5 space-y-3 pt-3 border-t border-slate-100 dark:border-navy-800/80">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {completedTasks} of {totalTasks} tasks finished
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {progressPercent}%
            </span>
          </div>
          <ProgressBar value={progressPercent} color={roadmap.color} size="md" />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Target: {formatDate(roadmap.targetDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold group-hover:translate-x-1 transition-transform">
            <span>View plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
