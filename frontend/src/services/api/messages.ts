import api from './client';
import { Message, ApiResponse } from '@/types';

export const messagesApi = {
  getAll: async (params?: { page?: number; search?: string }) => {
    const response = await api.get<ApiResponse<Message>>('/messages/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Message>(`/messages/${id}/`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/messages/stats/');
    return response.data;
  },
};
