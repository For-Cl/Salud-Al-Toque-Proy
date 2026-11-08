import apiClient from '../api/client';
import type { AvailabilityDTO } from '../types';

export const availabilityService = {
  getByProfessional: async (professionalId: number): Promise<AvailabilityDTO[]> => {
    const response = await apiClient.get<AvailabilityDTO[]>(`/availabilities/professional/${professionalId}`);
    return response.data;
  },
};

