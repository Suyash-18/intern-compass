import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Intern, Task, TaskAttachment } from '@/types';
import { internService } from '@/services/internService';
import { taskService } from '@/services/taskService';

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

  const refreshInterns = useCallback(async () => {
    try {
      const data = await internService.getInterns();
      setInterns(data);
    } catch {
      console.error('Failed to fetch interns');
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    try {
      const data = await taskService.getTasks();
      setCurrentInternTasks(data);
    } catch {
      console.error('Failed to fetch tasks');
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([refreshInterns(), refreshTasks()]);
      setIsLoading(false);
    };
    load();
  }, [refreshInterns, refreshTasks]);

  const submitTask = useCallback(async (taskId: string, attachments?: TaskAttachment[]) => {
    const result = await taskService.submitTask(taskId, attachments);
    if (result) {
      // Refresh tasks to get updated state
      await refreshTasks();
    }
  }, [refreshTasks]);

  const reviewTask = useCallback(
    async (internId: string, taskId: string, status: 'approved' | 'rejected', feedback: string) => {
      const result = await taskService.reviewTask(taskId, status, feedback);
      if (result) {
        // Refresh both interns and tasks to reflect changes
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
