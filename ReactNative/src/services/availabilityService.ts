import apiClient from '../api/client';
import type { AvailabilityDTO } from '../types';

export const availabilityService = {
  getByProfessional: async (professionalId: number): Promise<AvailabilityDTO[]> => {
    const response = await apiClient.get<AvailabilityDTO[]>(`/availabilities/professional/${professionalId}`);
    return response.data;
  },

  create: async (data: Omit<AvailabilityDTO, 'id' | 'professionalId'>): Promise<AvailabilityDTO> => {
    const response = await apiClient.post<AvailabilityDTO>('/availabilities', data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/availabilities/${id}`);
  },
};

