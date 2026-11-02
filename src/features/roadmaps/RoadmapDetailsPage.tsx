import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Map,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Roadmap, Task } from '../../types';
import { roadmapsService } from '../../services/roadmaps.service';
import { tasksService } from '../../services/tasks.service';
import { calculateRoadmapProgress } from '../../lib/progress';
import { formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TaskCard } from '../tasks/TaskCard';
import { TaskFormModal } from '../tasks/TaskFormModal';
import { TaskDetailsModal } from '../tasks/TaskDetailsModal';
import { RoadmapFormModal } from './RoadmapFormModal';
import { ConfirmModal } from '../../components/feedback/ConfirmModal';
import { useToast } from '../../context/ToastContext';

export const RoadmapDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [rData, tData] = await Promise.all([
        roadmapsService.getRoadmapById(id),
        tasksService.getTasks(),
      ]);
      if (!rData) {
        error('Roadmap not found.');
        navigate('/roadmaps');
        return;
      }
      setRoadmap(rData);
      setAllTasks(tData);
    } catch {
      error('Failed to load roadmap details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (isLoading || !roadmap) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-navy-800 animate-pulse rounded" />
        <div className="h-40 w-full bg-slate-200 dark:bg-navy-800 animate-pulse rounded-xl" />
      </div>
    );
  }

  const { progressPercent, totalTasks, completedTasks } = calculateRoadmapProgress(
    roadmap,
    allTasks
  );

  const associatedTasks = allTasks.filter(
    t => t.roadmapId === roadmap.id || (roadmap.taskIds && roadmap.taskIds.includes(t.id))
  );

  const handleUpdateRoadmap = async (data: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updated = await roadmapsService.updateRoadmap(roadmap.id, data);
      setRoadmap(updated);
      success('Roadmap updated.');
    } catch {
      error('Failed to update roadmap.');
    }
  };

  const handleDeleteRoadmap = async () => {
    try {
      await roadmapsService.deleteRoadmap(roadmap.id);
      success('Roadmap deleted.');
      navigate('/roadmaps');
    } catch {
      error('Failed to delete roadmap.');
    }
  };

  const handleCreateTaskForRoadmap = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress'>
  ) => {
    try {
      const created = await tasksService.createTask({
        ...taskData,
        roadmapId: roadmap.id,
        roadmapTitle: roadmap.title,
      });
      await roadmapsService.addTaskToRoadmap(roadmap.id, created.id);
      setAllTasks(prev => [created, ...prev]);
      success('Task created and added to roadmap!');
    } catch {
      error('Failed to add task to roadmap.');
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const updated = await tasksService.toggleTaskComplete(taskId);
      setAllTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
    } catch {
      error('Failed to update task.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/roadmaps')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Roadmaps</span>
        </button>
      </div>

      {/* Main Roadmap Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {roadmap.category}
              </span>
              <span className="text-xs font-medium capitalize text-slate-400">
                Status: {roadmap.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {roadmap.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {roadmap.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => setIsDeleteModalOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Progress & Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-navy-800">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800/40 border border-slate-200 dark:border-navy-700">
            <span className="text-xs text-slate-400 block mb-1">Execution Progress</span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {progressPercent}%
              </span>
              <span className="text-xs text-slate-500">
                ({completedTasks} of {totalTasks} tasks)
              </span>
            </div>
            <ProgressBar value={progressPercent} color={roadmap.color} size="sm" />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800/40 border border-slate-200 dark:border-navy-700">
            <span className="text-xs text-slate-400 block mb-1">Timeline</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>{formatDate(roadmap.startDate)} → {formatDate(roadmap.targetDate)}</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Target completion milestone
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800/40 border border-slate-200 dark:border-navy-700">
            <span className="text-xs text-slate-400 block mb-1">Structured Stages</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>{roadmap.stages?.length || 0} Planned Phases</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Sequential growth curriculum
            </span>
          </div>
        </div>
      </div>

      {/* Structured Stages & Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Associated Tasks & Milestones ({associatedTasks.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Concrete tasks linked to this growth roadmap.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateTaskModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Task to Roadmap
          </Button>
        </div>

        {associatedTasks.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900">
            <Map className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No tasks associated yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Break down this roadmap by creating tasks mapped to its stages.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreateTaskModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create First Roadmap Task
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {associatedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onClick={setSelectedTask}
                onEdit={setEditingTask}
                onDelete={taskId => {
                  setAllTasks(prev => prev.filter(t => t.id !== taskId));
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Roadmap Modal */}
      {isEditModalOpen && (
        <RoadmapFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateRoadmap}
          initialData={roadmap}
        />
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteRoadmap}
          title="Delete Roadmap"
          description="Are you sure you want to delete this roadmap? Associated tasks will remain in your workspace as standalone tasks."
        />
      )}

      {/* Create Task Modal pre-assigned to this roadmap */}
      {isCreateTaskModalOpen && (
        <TaskFormModal
          isOpen={isCreateTaskModalOpen}
          onClose={() => setIsCreateTaskModalOpen(false)}
          onSubmit={handleCreateTaskForRoadmap}
          defaultRoadmapId={roadmap.id}
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
            setAllTasks(prev => prev.filter(t => t.id !== taskId));
          }}
          onToggleComplete={handleToggleComplete}
          onTaskUpdated={updated => {
            setAllTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
            setSelectedTask(updated);
          }}
        />
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <TaskFormModal
          isOpen={Boolean(editingTask)}
          onClose={() => setEditingTask(null)}
          onSubmit={async updatedData => {
            const updated = await tasksService.updateTask(editingTask.id, updatedData);
            setAllTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
            setEditingTask(null);
            success('Task updated.');
          }}
          initialData={editingTask}
        />
      )}
    </div>
  );
};
