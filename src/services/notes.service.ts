import { Note } from '../types';
import { apiClient } from './api';
import { mockStorage } from './storage';

export const notesService = {
  async getNotes(): Promise<Note[]> {
    try {
      const res = await apiClient.get<Note[]>('/notes');
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 100));
      return mockStorage.getNotes();
    }
  },

  async getNoteById(id: string): Promise<Note | null> {
    try {
      const res = await apiClient.get<Note>(`/notes/${id}`);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 70));
      const notes = mockStorage.getNotes();
      return notes.find(n => n.id === id) || null;
    }
  },

  async createNote(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      const res = await apiClient.post<Note>('/notes', data);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 130));
      const notes = mockStorage.getNotes();
      const now = new Date().toISOString();
      const newNote: Note = {
        ...data,
        id: `note_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };

      mockStorage.setNotes([newNote, ...notes]);
      mockStorage.addActivity({
        type: 'note_created',
        title: 'Created note',
        description: newNote.title,
        entityId: newNote.id,
        entityType: 'note',
      });
      return newNote;
    }
  },

  async updateNote(id: string, data: Partial<Note>): Promise<Note> {
    try {
      const res = await apiClient.patch<Note>(`/notes/${id}`, data);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 90));
      const notes = mockStorage.getNotes();
      const index = notes.findIndex(n => n.id === id);
      if (index === -1) throw new Error('Note not found');

      const updated: Note = {
        ...notes[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      notes[index] = updated;
      mockStorage.setNotes([...notes]);
      return updated;
    }
  },

  async deleteNote(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/notes/${id}`);
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 80));
      const notes = mockStorage.getNotes();
      mockStorage.setNotes(notes.filter(n => n.id !== id));
      return true;
    }
  },
};
