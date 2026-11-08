import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'salud_al_toque_jwt_token';
const PROFILE_KEY = 'salud_al_toque_user_profile';
const SHAKE_KEY = 'salud_al_toque_shake_enabled';

let memoryToken: string | null = null;
let memoryProfile: string | null = null;
let memoryShakeEnabled: boolean = true;

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

  async saveProfile(profile: any): Promise<void> {
    const raw = JSON.stringify(profile);
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        await SecureStore.setItemAsync(PROFILE_KEY, raw);
      } else {
        memoryProfile = raw;
      }
    } catch {
      memoryProfile = raw;
    }
  },

  async getProfile(): Promise<any | null> {
    try {
      let raw: string | null = null;
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        raw = await SecureStore.getItemAsync(PROFILE_KEY);
      } else {
        raw = memoryProfile;
      }
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async deleteProfile(): Promise<void> {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        await SecureStore.deleteItemAsync(PROFILE_KEY);
      }
      memoryProfile = null;
    } catch {
      memoryProfile = null;
    }
  },

  async saveShakeEnabled(enabled: boolean): Promise<void> {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        await SecureStore.setItemAsync(SHAKE_KEY, enabled ? 'true' : 'false');
      } else {
        memoryShakeEnabled = enabled;
      }
    } catch {
      memoryShakeEnabled = enabled;
    }
  },

  async getShakeEnabled(): Promise<boolean> {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        const val = await SecureStore.getItemAsync(SHAKE_KEY);
        if (val !== null) {
          return val === 'true';
        }
      }
      return memoryShakeEnabled;
    } catch {
      return memoryShakeEnabled;
    }
  },
};
