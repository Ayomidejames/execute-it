import { Milestone } from '../types';
import { apiClient } from './api';
import { tasksService } from './tasks.service';
import { mockStorage } from './storage';

export const milestonesService = {
  async getMilestones(taskId: string): Promise<Milestone[]> {
    try {
      const res = await apiClient.get<Milestone[]>(`/tasks/${taskId}/milestones`);
      return res.data;
    } catch {
      const task = await tasksService.getTaskById(taskId);
      return task?.milestones || [];
    }
  },

  async createMilestone(
    taskId: string,
    data: Omit<Milestone, 'id' | 'taskId' | 'createdAt' | 'updatedAt'>
  ): Promise<Milestone> {
    try {
      const res = await apiClient.post<Milestone>(`/tasks/${taskId}/milestones`, data);
      return res.data;
    } catch {
      const task = await tasksService.getTaskById(taskId);
      if (!task) throw new Error('Task not found');

      const now = new Date().toISOString();
      const newMilestone: Milestone = {
        ...data,
        id: `ms_${Date.now()}`,
        taskId,
        createdAt: now,
        updatedAt: now,
      };

      const milestones = [...(task.milestones || []), newMilestone];
      await tasksService.updateTask(taskId, { milestones });
      return newMilestone;
    }
  },

  async updateMilestone(
    taskId: string,
    milestoneId: string,
    data: Partial<Milestone>
  ): Promise<Milestone> {
    try {
      const res = await apiClient.patch<Milestone>(`/milestones/${milestoneId}`, data);
      return res.data;
    } catch {
      const task = await tasksService.getTaskById(taskId);
      if (!task || !task.milestones) throw new Error('Task or milestones not found');

      const index = task.milestones.findIndex(m => m.id === milestoneId);
      if (index === -1) throw new Error('Milestone not found');

      const updated: Milestone = {
        ...task.milestones[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [...task.milestones];
      updatedList[index] = updated;

      await tasksService.updateTask(taskId, { milestones: updatedList });

      if (data.isCompleted) {
        mockStorage.addActivity({
          type: 'milestone_completed',
          title: 'Completed milestone',
          description: `${updated.title} in "${task.title}"`,
          entityId: task.id,
          entityType: 'task',
        });
      }

      return updated;
    }
  },

  async toggleMilestoneComplete(taskId: string, milestoneId: string): Promise<Milestone> {
    const task = await tasksService.getTaskById(taskId);
    const m = task?.milestones?.find(ms => ms.id === milestoneId);
    if (!m) throw new Error('Milestone not found');

    return this.updateMilestone(taskId, milestoneId, {
      isCompleted: !m.isCompleted,
    });
  },

  async deleteMilestone(taskId: string, milestoneId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/milestones/${milestoneId}`);
      return true;
    } catch {
      const task = await tasksService.getTaskById(taskId);
      if (!task || !task.milestones) return false;

      const filtered = task.milestones.filter(m => m.id !== milestoneId);
      await tasksService.updateTask(taskId, { milestones: filtered });
      return true;
    }
  },

  async reorderMilestones(taskId: string, orderedMilestoneIds: string[]): Promise<Milestone[]> {
    try {
      const res = await apiClient.post<Milestone[]>(`/tasks/${taskId}/milestones/reorder`, {
        order: orderedMilestoneIds,
      });
      return res.data;
    } catch {
      const task = await tasksService.getTaskById(taskId);
      if (!task || !task.milestones) return [];

      const map = new Map(task.milestones.map(m => [m.id, m]));
      const reordered: Milestone[] = [];

      orderedMilestoneIds.forEach((id, index) => {
        const item = map.get(id);
        if (item) {
          reordered.push({ ...item, order: index + 1 });
        }
      });

      await tasksService.updateTask(taskId, { milestones: reordered });
      return reordered;
    }
  },
};
