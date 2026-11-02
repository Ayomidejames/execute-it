import { User } from '../types';
import { apiClient } from './api';
import { mockStorage } from './storage';

export interface SignInCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

const AUTH_TOKEN_KEY = 'executeit_demo_authenticated';

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await apiClient.get<User>('/auth/me');
      return res.data;
    } catch {
      // In mock/demo mode, verify if demo session flag is active
      const isAuthenticated = localStorage.getItem(AUTH_TOKEN_KEY) !== 'false';
      if (!isAuthenticated) return null;
      return mockStorage.getUser();
    }
  },

  async signIn(creds: SignInCredentials): Promise<{ user: User }> {
    try {
      const res = await apiClient.post<{ user: User }>('/auth/login', creds);
      localStorage.setItem(AUTH_TOKEN_KEY, 'true');
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 350));
      // Demo validation: ensure email is valid
      if (!creds.email || !creds.email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      localStorage.setItem(AUTH_TOKEN_KEY, 'true');
      const user = mockStorage.getUser();
      return { user };
    }
  },

  async signUp(data: SignUpData): Promise<{ user: User }> {
    try {
      const res = await apiClient.post<{ user: User }>('/auth/register', data);
      localStorage.setItem(AUTH_TOKEN_KEY, 'true');
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 450));
      const currentUser = mockStorage.getUser();
      const updatedUser: User = {
        ...currentUser,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      };
      mockStorage.setUser(updatedUser);
      localStorage.setItem(AUTH_TOKEN_KEY, 'true');
      return { user: updatedUser };
    }
  },

  async signOut(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore mock error
    } finally {
      localStorage.setItem(AUTH_TOKEN_KEY, 'false');
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const res = await apiClient.patch<User>('/users/me', data);
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 150));
      const current = mockStorage.getUser();
      const updated = { ...current, ...data };
      mockStorage.setUser(updated);
      return updated;
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 300));
      return {
        success: true,
        message: `Password reset instructions have been dispatched to ${email}. Check your inbox.`,
      };
    }
  },

  async resetPassword(password: string): Promise<{ success: boolean }> {
    try {
      const res = await apiClient.post<{ success: boolean }>('/auth/reset-password', { password });
      return res.data;
    } catch {
      await new Promise(r => setTimeout(r, 300));
      return { success: true };
    }
  },
};
