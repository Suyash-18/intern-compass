import { apiService, USE_MOCK_DATA } from './api';
import { API_ENDPOINTS } from '@/utils/apiEndpoints';

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedDays: number;
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

  async createTemplate(data: Omit<TaskTemplate, 'id' | 'createdAt'>): Promise<TaskTemplate | null> {
    if (USE_MOCK_DATA) return null;
    try {
      const res = await apiService.post<TemplateResponse>(API_ENDPOINTS.TASK_TEMPLATES.CREATE, data);
      return res.template;
    } catch {
      return null;
    }
  },

  async updateTemplate(id: string, data: Partial<TaskTemplate>): Promise<TaskTemplate | null> {
    if (USE_MOCK_DATA) return null;
    try {
      const res = await apiService.put<TemplateResponse>(API_ENDPOINTS.TASK_TEMPLATES.UPDATE(id), data);
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
