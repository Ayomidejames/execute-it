import {
  INITIAL_TASKS,
  INITIAL_ROADMAPS,
  INITIAL_NOTES,
  INITIAL_REMINDERS,
  INITIAL_USER,
  INITIAL_ACTIVITIES,
} from './mock-data';
import { Task, Roadmap, Note, Reminder, User, ActivityItem } from '../types';

const STORAGE_KEYS = {
  TASKS: 'executeit_tasks_v1',
  ROADMAPS: 'executeit_roadmaps_v1',
  NOTES: 'executeit_notes_v1',
  REMINDERS: 'executeit_reminders_v1',
  USER: 'executeit_user_v1',
  ACTIVITIES: 'executeit_activities_v1',
  AUTH: 'executeit_auth_state_v1',
};

// Safe storage utilities with error handling and fallback
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key} to storage:`, e);
  }
}

export const mockStorage = {
  getTasks: (): Task[] => loadFromStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS),
  setTasks: (tasks: Task[]): void => saveToStorage(STORAGE_KEYS.TASKS, tasks),

  getRoadmaps: (): Roadmap[] => loadFromStorage(STORAGE_KEYS.ROADMAPS, INITIAL_ROADMAPS),
  setRoadmaps: (roadmaps: Roadmap[]): void => saveToStorage(STORAGE_KEYS.ROADMAPS, roadmaps),

  getNotes: (): Note[] => loadFromStorage(STORAGE_KEYS.NOTES, INITIAL_NOTES),
  setNotes: (notes: Note[]): void => saveToStorage(STORAGE_KEYS.NOTES, notes),

  getReminders: (): Reminder[] => loadFromStorage(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS),
  setReminders: (reminders: Reminder[]): void => saveToStorage(STORAGE_KEYS.REMINDERS, reminders),

  getUser: (): User => loadFromStorage(STORAGE_KEYS.USER, INITIAL_USER),
  setUser: (user: User): void => saveToStorage(STORAGE_KEYS.USER, user),

  getActivities: (): ActivityItem[] => loadFromStorage(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES),
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>): void => {
    const current = loadFromStorage(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    const newAct: ActivityItem = {
      ...activity,
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.ACTIVITIES, [newAct, ...current].slice(0, 30));
  },

  resetToDemo: (): void => {
    saveToStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    saveToStorage(STORAGE_KEYS.ROADMAPS, INITIAL_ROADMAPS);
    saveToStorage(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    saveToStorage(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
    saveToStorage(STORAGE_KEYS.USER, INITIAL_USER);
    saveToStorage(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },
};
