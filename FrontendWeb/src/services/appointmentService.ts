import apiClient from '../api/client';
import type { AppointmentDTO, CreateAppointmentRequest } from '../types';

export const appointmentService = {
  getMyAppointments: async (signal?: AbortSignal): Promise<AppointmentDTO[]> => {
    const response = await apiClient.get<AppointmentDTO[]>('/appointments/my-appointments', { signal });
    return response.data;
  },

  getMyProfessionalAppointments: async (signal?: AbortSignal): Promise<AppointmentDTO[]> => {
    const response = await apiClient.get<AppointmentDTO[]>('/appointments/my-professional-appointments', { signal });
    return response.data;
  },

  create: async (data: CreateAppointmentRequest): Promise<AppointmentDTO> => {
    const response = await apiClient.post<AppointmentDTO>('/appointments', data);
    return response.data;
  },

  accept: async (id: number): Promise<AppointmentDTO> => {
    const response = await apiClient.patch<AppointmentDTO>(`/appointments/${id}/accept`);
    return response.data;
  },

  reject: async (id: number): Promise<AppointmentDTO> => {
    const response = await apiClient.patch<AppointmentDTO>(`/appointments/${id}/reject`);
    return response.data;
  },

  complete: async (id: number): Promise<AppointmentDTO> => {
    const response = await apiClient.patch<AppointmentDTO>(`/appointments/${id}/complete`);
    return response.data;
  },
};

