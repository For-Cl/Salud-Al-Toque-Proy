import apiClient from '../api/client';
import type { ProfessionalDTO } from '../types';

interface ProfessionalFilters {
  specialty?: string;
  location?: string;
  maxPrice?: number;
}

export const professionalService = {
  getAll: async (filters?: ProfessionalFilters): Promise<ProfessionalDTO[]> => {
    const params: Record<string, string> = {};
    if (filters?.specialty) params.specialty = filters.specialty;
    if (filters?.location) params.location = filters.location;
    if (filters?.maxPrice) params.maxPrice = String(filters.maxPrice);
    const response = await apiClient.get<ProfessionalDTO[]>('/professionals', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ProfessionalDTO> => {
    const response = await apiClient.get<ProfessionalDTO>(`/professionals/${id}`);
    return response.data;
  },
};

