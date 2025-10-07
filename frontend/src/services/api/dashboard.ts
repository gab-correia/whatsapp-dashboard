import api from './client';
import { DashboardStats } from '@/types';

export const dashboardApi = {
  getStats: async () => {
    const response = await api.get<DashboardStats>('/dashboard/stats/');
    return response.data;
  },
};
