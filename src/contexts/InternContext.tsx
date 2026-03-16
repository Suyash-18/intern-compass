import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Intern, Task, TaskAttachment } from '@/types';
import { internService } from '@/services/internService';
import { taskService } from '@/services/taskService';
import { useAuth } from '@/contexts/AuthContext';

interface InternContextType {
  interns: Intern[];
  currentInternTasks: Task[];
  isLoading: boolean;
  setCurrentInternTasks: (tasks: Task[]) => void;
  submitTask: (taskId: string, attachments?: TaskAttachment[]) => Promise<void>;
  reviewTask: (internId: string, taskId: string, status: 'approved' | 'rejected', feedback: string) => Promise<void>;
  getInternById: (id: string) => Intern | undefined;
  refreshInterns: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const InternContext = createContext<InternContextType | undefined>(undefined);

export function InternProvider({ children }: { children: React.ReactNode }) {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [currentInternTasks, setCurrentInternTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const refreshInterns = useCallback(async () => {
    if (!isAdmin) return; // Only admins can fetch all interns
    try {
      const data = await internService.getInterns();
      setInterns(data);
    } catch {
      console.error('Failed to fetch interns');
    }
  }, [isAdmin]);

  const refreshTasks = useCallback(async () => {
    try {
      const data = await taskService.getTasks();
      setCurrentInternTasks(data);
    } catch {
      console.error('Failed to fetch tasks');
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      if (isAdmin) {
        await Promise.all([refreshInterns(), refreshTasks()]);
      } else {
        await refreshTasks();
      }
      setIsLoading(false);
    };
    load();
  }, [user, isAdmin, refreshInterns, refreshTasks]);

  const submitTask = useCallback(async (taskId: string, attachments?: TaskAttachment[]) => {
    const result = await taskService.submitTask(taskId, attachments);
    if (result) {
      await refreshTasks();
    }
  }, [refreshTasks]);

  const reviewTask = useCallback(
    async (internId: string, taskId: string, status: 'approved' | 'rejected', feedback: string) => {
      const result = await taskService.reviewTask(taskId, status, feedback);
      if (result) {
        await Promise.all([refreshInterns(), refreshTasks()]);
      }
    },
    [refreshInterns, refreshTasks]
  );

  const getInternById = useCallback(
    (id: string) => interns.find((intern) => intern.id === id),
    [interns]
  );

  return (
    <InternContext.Provider
      value={{
        interns,
        currentInternTasks,
        isLoading,
        setCurrentInternTasks,
        submitTask,
        reviewTask,
        getInternById,
        refreshInterns,
        refreshTasks,
      }}
    >
      {children}
    </InternContext.Provider>
  );
}

export function useInterns() {
  const context = useContext(InternContext);
  if (context === undefined) {
    throw new Error('useInterns must be used within an InternProvider');
  }
  return context;
}
