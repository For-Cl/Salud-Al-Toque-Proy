import apiClient from '../api/client';
import type { MedicalServiceDTO } from '../types';

export const medicalServiceService = {
  getAll: async (signal?: AbortSignal): Promise<MedicalServiceDTO[]> => {
    const response = await apiClient.get<MedicalServiceDTO[]>('/medical-services', { signal });
    return response.data;
  },

  getById: async (id: number, signal?: AbortSignal): Promise<MedicalServiceDTO> => {
    const response = await apiClient.get<MedicalServiceDTO>(`/medical-services/${id}`, { signal });
    return response.data;
  },

  getByProfessional: async (professionalId: number, signal?: AbortSignal): Promise<MedicalServiceDTO[]> => {
    const response = await apiClient.get<MedicalServiceDTO[]>(`/medical-services/professional/${professionalId}`, { signal });
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

