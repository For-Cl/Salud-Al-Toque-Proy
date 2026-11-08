import apiClient from '../api/client';
import type { MedicalServiceDTO } from '../types';

export const medicalServiceService = {
  getByProfessional: async (professionalId: number): Promise<MedicalServiceDTO[]> => {
    const response = await apiClient.get<MedicalServiceDTO[]>(`/medical-services/professional/${professionalId}`);
    return response.data;
  },

  create: async (data: Omit<MedicalServiceDTO, 'id' | 'professionalId'>): Promise<MedicalServiceDTO> => {
    const response = await apiClient.post<MedicalServiceDTO>('/medical-services', data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/medical-services/${id}`);
  },
};

