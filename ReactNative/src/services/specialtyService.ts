import apiClient from '../api/client';
import type { SpecialtyDTO } from '../types';

export const specialtyService = {
  getAll: async (): Promise<SpecialtyDTO[]> => {
    const response = await apiClient.get<SpecialtyDTO[]>('/specialties');
    return response.data;
  },
};

