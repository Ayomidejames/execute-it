import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Map, Sparkles, Filter } from 'lucide-react';
import { Roadmap, Task } from '../../types';
import { roadmapsService } from '../../services/roadmaps.service';
import { tasksService } from '../../services/tasks.service';
import { RoadmapCard } from './RoadmapCard';
import { RoadmapFormModal } from './RoadmapFormModal';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs } from '../../components/ui/Tabs';
import { useToast } from '../../context/ToastContext';

export const RoadmapsPage: React.FC = () => {
  const { success, error } = useToast();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rData, tData] = await Promise.all([
        roadmapsService.getRoadmaps(),
        tasksService.getTasks(),
      ]);
      setRoadmaps(rData);
      setTasks(tData);
    } catch {
      error('Failed to load roadmaps.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter(r => {
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [roadmaps, selectedCategory, searchQuery]);

  const handleCreateRoadmap = async (data: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await roadmapsService.createRoadmap(data);
      setRoadmaps(prev => [created, ...prev]);
      success('Roadmap created successfully!');
    } catch {
      error('Failed to create roadmap.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Category Filter, Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Personal Growth Roadmaps
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structure your long-term ambitions into achievable milestones and execution streams.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Roadmap
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 shadow-subtle">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search roadmaps by title or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-800/60 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">Category:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-navy-800/60 rounded-lg border border-slate-200 dark:border-navy-700 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Categories</option>
            <option value="Career">Career</option>
            <option value="Technical">Technical</option>
            <option value="Personal">Personal</option>
            <option value="Education">Education</option>
            <option value="Projects">Projects</option>
          </select>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(n => (
            <Skeleton key={n} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRoadmaps.length === 0 && (
        <EmptyState
          icon={<Map className="w-6 h-6 text-emerald-600" />}
          title={searchQuery ? 'No matching roadmaps' : 'No growth roadmaps created yet'}
          description={
            searchQuery
              ? 'Try searching for different keywords or select All Categories.'
              : 'Create your first roadmap to start breaking major goals into structured phases.'
          }
          actionLabel="Create your first roadmap"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Roadmaps Grid */}
      {!isLoading && filteredRoadmaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoadmaps.map(roadmap => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} allTasks={tasks} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <RoadmapFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateRoadmap}
        />
      )}
    </div>
  );
};
