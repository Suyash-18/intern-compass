/**
 * Intern Management Service
 * 
 * Handles all intern-related API calls for admin operations.
 * Uses mock data when USE_MOCK_DATA is true.
 * 
 * API Endpoints Used:
 * - GET /interns - List all interns
 * - GET /interns/:id - Get intern by ID
 * - PUT /interns/:id - Update intern
 * - DELETE /interns/:id - Delete intern
 * - GET /interns/search?q=query - Search interns
 * - GET /interns/export/csv - Export to CSV
 * - GET /interns/export/excel - Export to Excel
 */

import { apiService, USE_MOCK_DATA } from './api';
import { API_ENDPOINTS } from '@/utils/apiEndpoints';
import { mockInterns } from './mockData';
import type { Intern } from '@/types';

// API Response Types
interface InternsListResponse {
  interns: Intern[];
  total: number;
  page: number;
  limit: number;
}

interface InternResponse {
  intern: Intern;
}

/**
 * Intern Management Service
 */
export const internService = {
  /**
   * Get all interns
   * GET /interns
   * 
   * Query params: { page?: number, limit?: number, sort?: string }
   * Response: { interns: Intern[], total: number, page: number, limit: number }
   */
  async getInterns(): Promise<Intern[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockInterns;
    }

    try {
      const response = await apiService.get<InternsListResponse>(API_ENDPOINTS.INTERNS.LIST);
      return response.interns;
    } catch {
      console.error('Failed to fetch interns');
      return [];
    }
  },

  /**
   * Get intern by ID
   * GET /interns/:id
   * 
   * Response: { intern: Intern }
   */
  async getInternById(id: string): Promise<Intern | null> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return mockInterns.find((intern) => intern.id === id) || null;
    }

    try {
      const response = await apiService.get<InternResponse>(API_ENDPOINTS.INTERNS.GET_BY_ID(id));
      return response.intern;
    } catch {
      console.error('Failed to fetch intern');
      return null;
    }
  },

  /**
   * Search interns
   * GET /interns/search?q=query
   * 
   * Query params: { q: string }
   * Response: { interns: Intern[] }
   */
  async searchInterns(query: string): Promise<Intern[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const lowerQuery = query.toLowerCase();
      return mockInterns.filter(
        (intern) =>
          intern.profile.name.toLowerCase().includes(lowerQuery) ||
          intern.profile.email.toLowerCase().includes(lowerQuery) ||
          intern.profile.domain.toLowerCase().includes(lowerQuery)
      );
    }

    try {
      const response = await apiService.get<InternsListResponse>(
        `${API_ENDPOINTS.INTERNS.SEARCH}?q=${encodeURIComponent(query)}`
      );
      return response.interns;
    } catch {
      console.error('Failed to search interns');
      return [];
    }
  },

  /**
   * Update intern
   * PUT /interns/:id
   * 
   * Request: Partial<Intern>
   * Response: { intern: Intern }
   */
  async updateIntern(id: string, data: Partial<Intern>): Promise<Intern | null> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const intern = mockInterns.find((i) => i.id === id);
      return intern ? { ...intern, ...data } : null;
    }

    try {
      const response = await apiService.put<InternResponse>(
        API_ENDPOINTS.INTERNS.UPDATE(id),
        data
      );
      return response.intern;
    } catch {
      console.error('Failed to update intern');
      return null;
    }
  },

  /**
   * Delete intern
   * DELETE /interns/:id
   */
  async deleteIntern(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return true;
    }

    try {
      await apiService.delete(API_ENDPOINTS.INTERNS.DELETE(id));
      return true;
    } catch {
      console.error('Failed to delete intern');
      return false;
    }
  },

  /**
   * Export interns to CSV
   * GET /interns/export/csv
   */
  async exportToCsv(): Promise<void> {
    if (USE_MOCK_DATA) {
      // Generate CSV from mock data
      const headers = ['Name', 'Email', 'Mobile', 'Domain', 'College', 'Degree', 'Branch', 'Year', 'Progress'];
      const rows = mockInterns.map((intern) => {
        const completedTasks = intern.tasks.filter((t) => t.status === 'approved').length;
        const progress = Math.round((completedTasks / intern.tasks.length) * 100);
        return [
          intern.profile.name,
          intern.profile.email,
          intern.profile.mobile,
          intern.profile.domain,
          intern.profile.collegeName,
          intern.profile.degree,
          intern.profile.branch,
          intern.profile.yearOfPassing,
          `${progress}%`,
        ];
      });

      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'interns-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      return;
    }

    await apiService.downloadFile(API_ENDPOINTS.INTERNS.EXPORT_CSV, 'interns-export.csv');
  },

  /**
   * Export interns to Excel
   * GET /interns/export/excel
   */
  async exportToExcel(): Promise<void> {
    if (USE_MOCK_DATA) {
      // For mock, just create a CSV with .xlsx extension
      // In production, backend should return proper Excel file
      const headers = ['Name', 'Email', 'Mobile', 'Domain', 'College', 'Degree', 'Branch', 'Year', 'Progress'];
      const rows = mockInterns.map((intern) => {
        const completedTasks = intern.tasks.filter((t) => t.status === 'approved').length;
        const progress = Math.round((completedTasks / intern.tasks.length) * 100);
        return [
          intern.profile.name,
          intern.profile.email,
          intern.profile.mobile,
          intern.profile.domain,
          intern.profile.collegeName,
          intern.profile.degree,
          intern.profile.branch,
          intern.profile.yearOfPassing,
          `${progress}%`,
        ];
      });

      const csvContent = [headers, ...rows].map((row) => row.join('\t')).join('\n');
      const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'interns-export.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      return;
    }

    await apiService.downloadFile(API_ENDPOINTS.INTERNS.EXPORT_EXCEL, 'interns-export.xlsx');
  },
};

export default internService;
