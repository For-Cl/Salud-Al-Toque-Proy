import apiClient from '../api/client';
import type { SignInRequest, SignUpRequest, TokenResponse } from '../types';

export const authService = {
  signUp: async (data: SignUpRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/signup', data);
    return response.data;
  },

  signIn: async (data: SignInRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/signin', data);
    return response.data;
  },
};

