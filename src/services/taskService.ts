/**
 * Task Management Service
 * 
 * Handles all task-related API calls.
 * Uses mock data when USE_MOCK_DATA is true.
 * 
 * API Endpoints Used:
 * - GET /tasks - List tasks for current user
 * - GET /tasks/:id - Get task by ID
 * - POST /tasks/:id/submit - Submit task for review
 * - POST /tasks/:id/review - Review task (admin)
 * - POST /tasks/:id/attachments - Upload attachment
 * - DELETE /tasks/:taskId/attachments/:attachmentId - Delete attachment
 * - GET /tasks/:taskId/attachments/:attachmentId/download - Download attachment
 */

import { apiService, USE_MOCK_DATA } from './api';
import { API_ENDPOINTS } from '@/utils/apiEndpoints';
import { mockTasks } from './mockData';
import type { Task, TaskStatus, TaskAttachment } from '@/types';

// API Response Types
interface TasksListResponse {
  tasks: Task[];
}

interface TaskResponse {
  task: Task;
}

interface AttachmentResponse {
  attachment: TaskAttachment;
}

/**
 * Task Management Service
 */
export const taskService = {
  /**
   * Get tasks for current user
   * GET /tasks
   * 
   * Response: { tasks: Task[] }
   */
  async getTasks(): Promise<Task[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockTasks;
    }

    try {
      const response = await apiService.get<TasksListResponse>(API_ENDPOINTS.TASKS.LIST);
      return response.tasks;
    } catch {
      console.error('Failed to fetch tasks');
      return [];
    }
  },

  /**
   * Get task by ID
   * GET /tasks/:id
   * 
   * Response: { task: Task }
   */
  async getTaskById(id: string): Promise<Task | null> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return mockTasks.find((task) => task.id === id) || null;
    }

    try {
      const response = await apiService.get<TaskResponse>(API_ENDPOINTS.TASKS.GET_BY_ID(id));
      return response.task;
    } catch {
      console.error('Failed to fetch task');
      return null;
    }
  },

  /**
   * Submit task for review
   * POST /tasks/:id/submit
   * 
   * Request: { attachments?: TaskAttachment[] }
   * Response: { task: Task }
   */
  async submitTask(taskId: string, attachments?: TaskAttachment[]): Promise<Task | null> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const task = mockTasks.find((t) => t.id === taskId);
      if (task) {
        return {
          ...task,
          status: 'pending' as TaskStatus,
          submittedAt: new Date().toISOString(),
          attachments,
        };
      }
      return null;
    }

    try {
      const response = await apiService.post<TaskResponse>(
        API_ENDPOINTS.TASKS.SUBMIT(taskId),
        { attachments }
      );
      return response.task;
    } catch {
      console.error('Failed to submit task');
      return null;
    }
  },

  /**
   * Review task (Admin)
   * POST /tasks/:id/review
   * 
   * Request: { status: 'approved' | 'rejected', feedback: string }
   * Response: { task: Task }
   */
  async reviewTask(
    taskId: string,
    status: 'approved' | 'rejected',
    feedback: string
  ): Promise<Task | null> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const task = mockTasks.find((t) => t.id === taskId);
      if (task) {
        return {
          ...task,
          status,
          feedback,
          reviewedAt: new Date().toISOString(),
        };
      }
      return null;
    }

    try {
      const response = await apiService.post<TaskResponse>(
        API_ENDPOINTS.TASKS.REVIEW(taskId),
        { status, feedback }
      );
      return response.task;
    } catch {
      console.error('Failed to review task');
      return null;
    }
  },

  /**
   * Upload attachment
   * POST /tasks/:id/attachments
   * 
   * Request: FormData with file
   * Response: { attachment: TaskAttachment }
   */
  async uploadAttachment(taskId: string, file: File): Promise<TaskAttachment | null> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Create mock attachment with object URL
      const attachment: TaskAttachment = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 
              file.type.includes('image') ? 'image' : 
              file.type.includes('zip') ? 'zip' : 'other',
        size: file.size,
        url: URL.createObjectURL(file),
        mimeType: file.type,
      };
      return attachment;
    }

    try {
      const response = await apiService.uploadFile<AttachmentResponse>(
        API_ENDPOINTS.TASKS.UPLOAD_ATTACHMENT(taskId),
        file,
        'attachment'
      );
      return response.attachment;
    } catch {
      console.error('Failed to upload attachment');
      return null;
    }
  },

  /**
   * Delete attachment
   * DELETE /tasks/:taskId/attachments/:attachmentId
   */
  async deleteAttachment(taskId: string, attachmentId: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return true;
    }

    try {
      await apiService.delete(API_ENDPOINTS.TASKS.DELETE_ATTACHMENT(taskId, attachmentId));
      return true;
    } catch {
      console.error('Failed to delete attachment');
      return false;
    }
  },

  /**
   * Download attachment
   * GET /tasks/:taskId/attachments/:attachmentId/download
   */
  async downloadAttachment(taskId: string, attachmentId: string, filename: string): Promise<void> {
    if (USE_MOCK_DATA) {
      console.warn('Download not available in mock mode - use attachment URL directly');
      return;
    }

    await apiService.downloadFile(
      API_ENDPOINTS.TASKS.DOWNLOAD_ATTACHMENT(taskId, attachmentId),
      filename
    );
  },
};

export default taskService;
