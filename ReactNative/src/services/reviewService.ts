import apiClient from '../api/client';
import type { CreateReviewRequest, ReviewDTO } from '../types';

export const reviewService = {
  getAll: async (): Promise<ReviewDTO[]> => {
    const response = await apiClient.get<ReviewDTO[]>('/reviews');
    return response.data;
  },

  getByProfessional: async (professionalId: number): Promise<ReviewDTO[]> => {
    const response = await apiClient.get<ReviewDTO[]>(`/reviews/professional/${professionalId}`);
    return response.data;
  },

  create: async (data: CreateReviewRequest): Promise<ReviewDTO> => {
    const response = await apiClient.post<ReviewDTO>('/reviews', data);
    return response.data;
  },
};

