import apiClient from '../api/client';
import type { PatientDTO } from '../types';

export const patientService = {
  getMyProfile: async (signal?: AbortSignal): Promise<PatientDTO> => {
    const response = await apiClient.get<PatientDTO>('/patients/me', { signal });
    return response.data;
  },
};

