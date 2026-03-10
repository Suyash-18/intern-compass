import { apiService, USE_MOCK_DATA } from './api';
import { API_ENDPOINTS } from '@/utils/apiEndpoints';

export interface TemplateAttachment {
  _id: string;
  name: string;
  type: 'pdf' | 'image' | 'zip' | 'other';
  size: number;
  url: string;
  mimeType: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedDays: number;
  priority: string;
  attachments: TemplateAttachment[];
  createdAt: string;
}

interface TemplatesListResponse {
  templates: TaskTemplate[];
}

interface TemplateResponse {
  template: TaskTemplate;
}

export const templateService = {
  async getTemplates(): Promise<TaskTemplate[]> {
    if (USE_MOCK_DATA) return [];
    try {
      const res = await apiService.get<TemplatesListResponse>(API_ENDPOINTS.TASK_TEMPLATES.LIST);
      return res.templates;
    } catch {
      return [];
    }
  },

  async createTemplate(data: {
    title: string;
    description: string;
    category: string;
    estimatedDays: number;
    files?: File[];
  }): Promise<TaskTemplate | null> {
    if (USE_MOCK_DATA) return null;
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('estimatedDays', String(data.estimatedDays));
      if (data.files) {
        data.files.forEach((file) => formData.append('attachments', file));
      }
      const res = await apiService.uploadFormData<TemplateResponse>(
        API_ENDPOINTS.TASK_TEMPLATES.CREATE,
        formData
      );
      return res.template;
    } catch {
      return null;
    }
  },

  async updateTemplate(
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      estimatedDays?: number;
      files?: File[];
      removeAttachmentIds?: string[];
    }
  ): Promise<TaskTemplate | null> {
    if (USE_MOCK_DATA) return null;
    try {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.category !== undefined) formData.append('category', data.category);
      if (data.estimatedDays) formData.append('estimatedDays', String(data.estimatedDays));
      if (data.removeAttachmentIds?.length) {
        formData.append('removeAttachmentIds', JSON.stringify(data.removeAttachmentIds));
      }
      if (data.files) {
        data.files.forEach((file) => formData.append('attachments', file));
      }
      const res = await apiService.uploadFormData<TemplateResponse>(
        API_ENDPOINTS.TASK_TEMPLATES.UPDATE(id),
        formData,
        'PUT'
      );
      return res.template;
    } catch {
      return null;
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) return false;
    try {
      await apiService.delete(API_ENDPOINTS.TASK_TEMPLATES.DELETE(id));
      return true;
    } catch {
      return false;
    }
  },

  async duplicateTemplate(id: string): Promise<TaskTemplate | null> {
    if (USE_MOCK_DATA) return null;
    try {
      const res = await apiService.post<TemplateResponse>(API_ENDPOINTS.TASK_TEMPLATES.DUPLICATE(id));
      return res.template;
    } catch {
      return null;
    }
  },
};

export default templateService;
