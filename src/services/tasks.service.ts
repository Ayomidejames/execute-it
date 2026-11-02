import { Task, Milestone } from '../types';
import { apiClient } from './api';
import { mockStorage } from './storage';
import { calculateTaskProgress } from '../lib/progress';

export const tasksService = {
  async getTasks(): Promise<Task[]> {
    try {
      const res = await apiClient.get<Task[]>('/tasks');
      return res.data;
    } catch {
      // Mock fallback
      await new Promise(r => setTimeout(r, 120));
      const tasks = mockStorage.getTasks();
      return tasks.map(t => ({
        ...t,
        progress: calculateTaskProgress(t),
      }));
    }
  },

  async getTaskById(id: string): Promise<Task | null> {
    try {
      const res = await apiClient.get<Task>(`/tasks/${id}`);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 80));
      const tasks = mockStorage.getTasks();
      const task = tasks.find(t => t.id === id);
      if (!task) return null;
      return {
        ...task,
        progress: calculateTaskProgress(task),
      };
    }
  },

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress'>): Promise<Task> {
    try {
      const res = await apiClient.post<Task>('/tasks', data);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 150));
      const tasks = mockStorage.getTasks();
      const now = new Date().toISOString();
      const newTask: Task = {
        ...data,
        id: `task_${Date.now()}`,
        milestones: data.milestones || [],
        createdAt: now,
        updatedAt: now,
      };
      newTask.progress = calculateTaskProgress(newTask);
      mockStorage.setTasks([newTask, ...tasks]);
      mockStorage.addActivity({
        type: 'task_created',
        title: 'Created task',
        description: newTask.title,
        entityId: newTask.id,
        entityType: 'task',
      });
      return newTask;
    }
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    try {
      const res = await apiClient.patch<Task>(`/tasks/${id}`, data);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 120));
      const tasks = mockStorage.getTasks();
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Task not found');

      const updated: Task = {
        ...tasks[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      updated.progress = calculateTaskProgress(updated);
      tasks[index] = updated;
      mockStorage.setTasks([...tasks]);
      return updated;
    }
  },

  async deleteTask(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/tasks/${id}`);
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 100));
      const tasks = mockStorage.getTasks();
      const filtered = tasks.filter(t => t.id !== id);
      mockStorage.setTasks(filtered);
      return true;
    }
  },

  async toggleTaskComplete(id: string): Promise<Task> {
    const task = await this.getTaskById(id);
    if (!task) throw new Error('Task not found');

    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    // If completing the task, also mark all milestones as completed
    let updatedMilestones = task.milestones;
    if (nextStatus === 'completed' && updatedMilestones) {
      updatedMilestones = updatedMilestones.map(m => ({ ...m, isCompleted: true }));
    }

    const updated = await this.updateTask(id, {
      status: nextStatus,
      milestones: updatedMilestones,
    });

    if (nextStatus === 'completed') {
      mockStorage.addActivity({
        type: 'task_completed',
        title: 'Completed task',
        description: task.title,
        entityId: task.id,
        entityType: 'task',
      });
    }

    return updated;
  },

  async addMilestonesToTask(taskId: string, newMilestones: Omit<Milestone, 'id' | 'taskId' | 'createdAt' | 'updatedAt'>[]): Promise<Task> {
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    const existingMilestones = task.milestones || [];
    const now = new Date().toISOString();
    const created: Milestone[] = newMilestones.map((m, idx) => ({
      ...m,
      id: `ms_${Date.now()}_${idx}`,
      taskId,
      createdAt: now,
      updatedAt: now,
    }));

    const combined = [...existingMilestones, ...created];
    return await this.updateTask(taskId, { milestones: combined });
  }
};
