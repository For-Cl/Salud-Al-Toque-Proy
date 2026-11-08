import apiClient from '../api/client';
import type { SpecialtyDTO } from '../types';

export const specialtyService = {
  getAll: async (signal?: AbortSignal): Promise<SpecialtyDTO[]> => {
    const response = await apiClient.get<SpecialtyDTO[]>('/specialties', { signal });
    return response.data;
  },

  getById: async (id: number, signal?: AbortSignal): Promise<SpecialtyDTO> => {
    const response = await apiClient.get<SpecialtyDTO>(`/specialties/${id}`, { signal });
    return response.data;
  },
};

