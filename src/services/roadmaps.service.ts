import { Roadmap } from '../types';
import { apiClient } from './api';
import { mockStorage } from './storage';

export const roadmapsService = {
  async getRoadmaps(): Promise<Roadmap[]> {
    try {
      const res = await apiClient.get<Roadmap[]>('/roadmaps');
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 100));
      return mockStorage.getRoadmaps();
    }
  },

  async getRoadmapById(id: string): Promise<Roadmap | null> {
    try {
      const res = await apiClient.get<Roadmap>(`/roadmaps/${id}`);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 80));
      const roadmaps = mockStorage.getRoadmaps();
      return roadmaps.find(r => r.id === id) || null;
    }
  },

  async createRoadmap(
    data: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Roadmap> {
    try {
      const res = await apiClient.post<Roadmap>('/roadmaps', data);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 140));
      const roadmaps = mockStorage.getRoadmaps();
      const now = new Date().toISOString();
      const newRoadmap: Roadmap = {
        ...data,
        id: `rdm_${Date.now()}`,
        taskIds: data.taskIds || [],
        stages: data.stages || [],
        createdAt: now,
        updatedAt: now,
      };

      mockStorage.setRoadmaps([newRoadmap, ...roadmaps]);
      mockStorage.addActivity({
        type: 'roadmap_updated',
        title: 'Created roadmap',
        description: newRoadmap.title,
        entityId: newRoadmap.id,
        entityType: 'roadmap',
      });
      return newRoadmap;
    }
  },

  async updateRoadmap(id: string, data: Partial<Roadmap>): Promise<Roadmap> {
    try {
      const res = await apiClient.patch<Roadmap>(`/roadmaps/${id}`, data);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 110));
      const roadmaps = mockStorage.getRoadmaps();
      const index = roadmaps.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Roadmap not found');

      const updated: Roadmap = {
        ...roadmaps[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      roadmaps[index] = updated;
      mockStorage.setRoadmaps([...roadmaps]);
      return updated;
    }
  },

  async deleteRoadmap(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/roadmaps/${id}`);
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 90));
      const roadmaps = mockStorage.getRoadmaps();
      mockStorage.setRoadmaps(roadmaps.filter(r => r.id !== id));
      return true;
    }
  },

  async addTaskToRoadmap(roadmapId: string, taskId: string, stageId?: string): Promise<Roadmap> {
    const roadmap = await this.getRoadmapById(roadmapId);
    if (!roadmap) throw new Error('Roadmap not found');

    const updatedTaskIds = Array.from(new Set([...roadmap.taskIds, taskId]));
    let updatedStages = roadmap.stages;

    if (stageId && updatedStages) {
      updatedStages = updatedStages.map(stage => {
        if (stage.id === stageId && !stage.taskIds.includes(taskId)) {
          return { ...stage, taskIds: [...stage.taskIds, taskId] };
        }
        return stage;
      });
    }

    return this.updateRoadmap(roadmapId, {
      taskIds: updatedTaskIds,
      stages: updatedStages,
    });
  },
};
