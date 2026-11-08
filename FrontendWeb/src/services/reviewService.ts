import apiClient from '../api/client';
import type { CreateReviewRequest, ReviewDTO } from '../types';

export const reviewService = {
  getAll: async (signal?: AbortSignal): Promise<ReviewDTO[]> => {
    const response = await apiClient.get<ReviewDTO[]>('/reviews', { signal });
    return response.data;
  },

  getById: async (id: number, signal?: AbortSignal): Promise<ReviewDTO> => {
    const response = await apiClient.get<ReviewDTO>(`/reviews/${id}`, { signal });
    return response.data;
  },

  getByProfessional: async (professionalId: number, signal?: AbortSignal): Promise<ReviewDTO[]> => {
    const response = await apiClient.get<ReviewDTO[]>(`/reviews/professional/${professionalId}`, { signal });
    return response.data;
  },

  create: async (data: CreateReviewRequest): Promise<ReviewDTO> => {
    const response = await apiClient.post<ReviewDTO>('/reviews', data);
    return response.data;
  },
};

