import apiClient from '../api/client';
import type { ProfessionalDTO } from '../types';

interface ProfessionalFilters {
  specialty?: string;
  location?: string;
  maxPrice?: number;
}

export const professionalService = {
  getAll: async (filters?: ProfessionalFilters, signal?: AbortSignal): Promise<ProfessionalDTO[]> => {
    const params = new URLSearchParams();
    if (filters?.specialty) params.append('specialty', filters.specialty);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    const response = await apiClient.get<ProfessionalDTO[]>('/professionals', { params, signal });
    return response.data;
  },

  getById: async (id: number, signal?: AbortSignal): Promise<ProfessionalDTO> => {
    const response = await apiClient.get<ProfessionalDTO>(`/professionals/${id}`, { signal });
    return response.data;
  },

  getMyProfile: async (signal?: AbortSignal): Promise<ProfessionalDTO> => {
    const response = await apiClient.get<ProfessionalDTO>('/professionals/me', { signal });
    return response.data;
  },

  updateMyProfile: async (data: { location?: string }): Promise<ProfessionalDTO> => {
    const response = await apiClient.put<ProfessionalDTO>('/professionals/me', data);
    return response.data;
  },

  createByAdmin: async (data: {
    user: { id: number };
    specialty: { id: number };
    location: string;
    rating?: number;
  }): Promise<ProfessionalDTO> => {
    const response = await apiClient.post<ProfessionalDTO>('/professionals', data);
    return response.data;
  },
};

