import api from './client';
import type { Contact } from '@/types';

export const contactsApi = {
  getAll: async (params?: { page?: number; search?: string }) => {
    const response = await api.get<Contact[]>('/contacts/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Contact>(`/contacts/${id}/`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/contacts/stats/');
    return response.data;
  },
};