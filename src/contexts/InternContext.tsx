import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Intern, Task, TaskStatus, TaskAttachment } from '@/types';
import { mockInterns, mockTasks } from '@/services/mockData';

interface InternContextType {
  interns: Intern[];
  currentInternTasks: Task[];
  setCurrentInternTasks: (tasks: Task[]) => void;
  submitTask: (taskId: string, attachments?: TaskAttachment[]) => void;
  reviewTask: (internId: string, taskId: string, status: 'approved' | 'rejected', feedback: string) => void;
  getInternById: (id: string) => Intern | undefined;
}

const InternContext = createContext<InternContextType | undefined>(undefined);

export function InternProvider({ children }: { children: React.ReactNode }) {
  const [interns, setInterns] = useState<Intern[]>(mockInterns);
  const [currentInternTasks, setCurrentInternTasks] = useState<Task[]>(mockTasks);

  const submitTask = useCallback((taskId: string, attachments?: TaskAttachment[]) => {
    setCurrentInternTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { 
              ...task, 
              status: 'pending' as TaskStatus, 
              submittedAt: new Date().toISOString(),
              attachments: attachments || task.attachments,
            }
          : task
      )
    );
  }, []);

  const reviewTask = useCallback(
    (internId: string, taskId: string, status: 'approved' | 'rejected', feedback: string) => {
      setInterns((prev) =>
        prev.map((intern) => {
          if (intern.id !== internId) return intern;

          const taskIndex = intern.tasks.findIndex((t) => t.id === taskId);
          if (taskIndex === -1) return intern;

          const updatedTasks = [...intern.tasks];
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            status,
            feedback,
            reviewedAt: new Date().toISOString(),
          };

          // If approved, unlock next task
          if (status === 'approved' && taskIndex + 1 < updatedTasks.length) {
            updatedTasks[taskIndex + 1] = {
              ...updatedTasks[taskIndex + 1],
              status: 'in_progress',
            };
          }

          return { ...intern, tasks: updatedTasks };
        })
      );
    },
    []
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
        setCurrentInternTasks,
        submitTask,
        reviewTask,
        getInternById,
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
