import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'salud_al_toque_jwt_token';
let memoryToken: string | null = null;

export const storage = {
  async saveToken(token: string): Promise<void> {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else {
        memoryToken = token;
      }
    } catch {
      memoryToken = token;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
      return memoryToken;
    } catch {
      return memoryToken;
    }
  },

  async deleteToken(): Promise<void> {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
      memoryToken = null;
    } catch {
      memoryToken = null;
    }
  },
};

