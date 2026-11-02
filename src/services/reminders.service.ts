import { Reminder } from '../types';
import { apiClient } from './api';
import { mockStorage } from './storage';

export const remindersService = {
  async getReminders(): Promise<Reminder[]> {
    try {
      const res = await apiClient.get<Reminder[]>('/reminders');
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 90));
      return mockStorage.getReminders();
    }
  },

  async createReminder(
    data: Omit<Reminder, 'id' | 'createdAt'>
  ): Promise<Reminder> {
    try {
      const res = await apiClient.post<Reminder>('/reminders', data);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 110));
      const reminders = mockStorage.getReminders();
      const newReminder: Reminder = {
        ...data,
        id: `rem_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      mockStorage.setReminders([newReminder, ...reminders]);
      return newReminder;
    }
  },

  async updateReminder(id: string, data: Partial<Reminder>): Promise<Reminder> {
    try {
      const res = await apiClient.patch<Reminder>(`/reminders/${id}`, data);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 80));
      const reminders = mockStorage.getReminders();
      const index = reminders.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Reminder not found');

      const updated = { ...reminders[index], ...data };
      reminders[index] = updated;
      mockStorage.setReminders([...reminders]);
      return updated;
    }
  },

  async toggleReminderComplete(id: string): Promise<Reminder> {
    const reminders = mockStorage.getReminders();
    const target = reminders.find(r => r.id === id);
    if (!target) throw new Error('Reminder not found');

    return this.updateReminder(id, { isCompleted: !target.isCompleted });
  },

  async deleteReminder(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/reminders/${id}`);
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 70));
      const reminders = mockStorage.getReminders();
      mockStorage.setReminders(reminders.filter(r => r.id !== id));
      return true;
    }
  },
};
