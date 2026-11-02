import { Milestone, Task, Roadmap } from '../types';

/**
 * Calculates task progress from its milestones when milestones exist.
 * Formula: (completedMilestones / totalMilestones) * 100.
 * If no milestones exist, returns 100% if status is 'completed', otherwise 0%.
 */
export function calculateTaskProgress(task: Partial<Task>): number {
  if (task.milestones && task.milestones.length > 0) {
    const completed = task.milestones.filter(m => m.isCompleted).length;
    return Math.round((completed / task.milestones.length) * 100);
  }

  return task.status === 'completed' ? 100 : 0;
}

/**
 * Calculates milestone counts (completed, total, remaining) for a task.
 */
export function getMilestoneStats(milestones?: Milestone[]): {
  completed: number;
  total: number;
  percent: number;
} {
  if (!milestones || milestones.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }
  const completed = milestones.filter(m => m.isCompleted).length;
  const total = milestones.length;
  const percent = Math.round((completed / total) * 100);
  return { completed, total, percent };
}

/**
 * Calculates roadmap progress from its associated tasks.
 * Formula: average progress of all associated tasks, or completedTasks / totalTasks * 100.
 */
export function calculateRoadmapProgress(roadmap: Roadmap, allTasks: Task[]): {
  progressPercent: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
} {
  const associatedTasks = allTasks.filter(
    t => t.roadmapId === roadmap.id || (roadmap.taskIds && roadmap.taskIds.includes(t.id))
  );

  if (associatedTasks.length === 0) {
    return {
      progressPercent: roadmap.status === 'completed' ? 100 : 0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
    };
  }

  const completedTasks = associatedTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = associatedTasks.filter(t => t.status === 'in_progress').length;

  // Use average task completion progress for granular accuracy
  const totalWeightedProgress = associatedTasks.reduce(
    (sum, t) => sum + calculateTaskProgress(t),
    0
  );

  const progressPercent = Math.round(totalWeightedProgress / associatedTasks.length);

  return {
    progressPercent,
    totalTasks: associatedTasks.length,
    completedTasks,
    inProgressTasks,
  };
}
