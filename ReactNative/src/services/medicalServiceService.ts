import apiClient from '../api/client';
import type { MedicalServiceDTO } from '../types';

export const medicalServiceService = {
  getByProfessional: async (professionalId: number): Promise<MedicalServiceDTO[]> => {
    const response = await apiClient.get<MedicalServiceDTO[]>(`/medical-services/professional/${professionalId}`);
    return response.data;
  },
};

