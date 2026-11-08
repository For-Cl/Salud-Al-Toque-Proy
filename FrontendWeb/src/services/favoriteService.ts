import apiClient from '../api/client';
import type { FavoriteDTO } from '../types';

export const favoriteService = {
  getMyFavorites: async (signal?: AbortSignal): Promise<FavoriteDTO[]> => {
    const response = await apiClient.get<FavoriteDTO[]>('/favorites/my-favorites', { signal });
    return response.data;
  },

  addFavorite: async (professionalId: number): Promise<FavoriteDTO> => {
    const response = await apiClient.post<FavoriteDTO>(`/favorites/professional/${professionalId}`);
    return response.data;
  },

  removeFavorite: async (id: number): Promise<void> => {
    await apiClient.delete(`/favorites/${id}`);
  },
};

