import apiClient from '../api/client';
import type { PatientDTO } from '../types';

export const patientService = {
  getMyProfile: async (): Promise<PatientDTO> => {
    const response = await apiClient.get<PatientDTO>('/patients/me');
    return response.data;
  },

  updateMyProfile: async (data: { address?: string; dateOfBirth?: string }): Promise<PatientDTO> => {
    const response = await apiClient.put<PatientDTO>('/patients/me', data);
    return response.data;
  },
};

