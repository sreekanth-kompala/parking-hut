import React, { createContext, useContext } from 'react';
import { type User } from 'firebase/auth';
import { UserProfile, TabID } from './types';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'error';
  message: string;
  steps?: string[];
  currentStep?: number;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  notify: (message: string, type?: 'info' | 'success' | 'error', steps?: string[], currentStep?: number) => string;
  updateNotify: (id: string, updates: Partial<Notification>) => void;
  dismissNotify: (id: string) => void;
  setActiveTab: (tab: TabID) => void;
  openAuth: (mode: 'login' | 'signup') => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  notify: () => '',
  updateNotify: () => {},
  dismissNotify: () => {},
  setActiveTab: () => {},
  openAuth: () => {}
});

export const useAuth = () => useContext(AuthContext);