export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

export interface Milestone {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  order: number;
  dueDate?: string;
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  dueTime?: string;
  roadmapId?: string;
  roadmapTitle?: string;
  tags: string[];
  milestones?: Milestone[];
  progress?: number; // Calculated dynamically from milestones or status
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  order: number;
  taskIds: string[];
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: 'Career' | 'Technical' | 'Personal' | 'Health' | 'Education' | 'Projects';
  status: 'active' | 'completed' | 'paused' | 'planning';
  targetDate: string;
  startDate: string;
  color: string;
  stages: RoadmapStage[];
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  taskId?: string;
  taskTitle?: string;
  roadmapId?: string;
  roadmapTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  isCompleted: boolean;
  taskId?: string;
  taskTitle?: string;
  syncedWithGoogle?: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  bio?: string;
  timezone?: string;
  themePreference: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  reminderAlerts: boolean;
  googleCalendarConnected: boolean;
  googleCalendarEmail?: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'task_completed' | 'task_created' | 'milestone_completed' | 'roadmap_updated' | 'note_created';
  title: string;
  description: string;
  timestamp: string;
  entityId?: string;
  entityType?: 'task' | 'roadmap' | 'note';
}

export interface AiMilestoneSuggestion {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedHours?: number;
  suggestedDueDaysFromNow?: number;
  selected?: boolean;
}
