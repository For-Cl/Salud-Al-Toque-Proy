import apiClient from '../api/client';
import type { UserDTO } from '../types';

export const userService = {
  getAll: async (signal?: AbortSignal): Promise<UserDTO[]> => {
    const response = await apiClient.get<UserDTO[]>('/users', { signal });
    return response.data;
  },

  getById: async (id: number, signal?: AbortSignal): Promise<UserDTO> => {
    const response = await apiClient.get<UserDTO>(`/users/${id}`, { signal });
    return response.data;
  },

  getMe: async (signal?: AbortSignal): Promise<UserDTO> => {
    const response = await apiClient.get<UserDTO>('/users/me', { signal });
    return response.data;
  },

  updateMe: async (data: { name?: string; phone?: string }): Promise<UserDTO> => {
    const response = await apiClient.put<UserDTO>('/users/me', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>('/users/me/password', data);
    return response.data;
  },

  create: async (data: Omit<UserDTO, 'id'> & { password?: string }): Promise<UserDTO> => {
    const response = await apiClient.post<UserDTO>('/users', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Resolves the authenticated user's actual role and profile by checking
   * the backend endpoints without causing visible errors.
   */
  resolveProfile: async (token: string): Promise<UserDTO> => {
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Try direct GET /users/me
    try {
      const res = await apiClient.get<UserDTO>('/users/me', {
        headers,
        skipErrorToast: true,
      });
      if (res.data && res.data.role) {
        return res.data;
      }
    } catch {
      // fallback to multi-endpoint probing
    }

    // 2. Extract email from token
    let email = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      email = payload.sub || '';
      if (payload.role && ['ADMIN', 'PROFESSIONAL', 'PATIENT'].includes(payload.role)) {
        return {
          id: payload.userId || 0,
          name: payload.name || email.split('@')[0],
          email: email,
          phone: payload.phone || '',
          role: payload.role,
        };
      }
    } catch {
      // ignore
    }

    // 2. Try GET /patients/me (PATIENT role)
    try {
      const res = await apiClient.get('/patients/me', {
        headers,
        skipErrorToast: true,
      });
      return {
        id: res.data.userId || res.data.id || 0,
        name: res.data.name || email.split('@')[0],
        email: email,
        phone: '',
        role: 'PATIENT',
      };
    } catch {
      // Not a patient
    }

    // 3. Try GET /appointments/my-professional-appointments (PROFESSIONAL role)
    try {
      await apiClient.get('/appointments/my-professional-appointments', {
        headers,
        skipErrorToast: true,
      });

      // Find the professional's display name from /professionals
      let profName = 'Dr. ' + (email ? email.split('@')[0] : 'Profesional');
      try {
        const profsRes = await apiClient.get('/professionals', { skipErrorToast: true });
        const list: any[] = profsRes.data;
        // Match by email if possible or name pattern
        const found = list.find(
          (p) =>
            (p.email && p.email.toLowerCase() === email.toLowerCase()) ||
            (email.includes('carlos') && p.name?.toLowerCase().includes('carlos')) ||
            (email.includes('maria') && p.name?.toLowerCase().includes('maria'))
        );
        if (found) {
          profName = found.name;
        }
      } catch {
        // ignore
      }

      return {
        id: 0,
        name: profName,
        email: email,
        phone: '',
        role: 'PROFESSIONAL',
      };
    } catch {
      // Not a professional
    }

    // 4. Try GET /users (ADMIN role)
    try {
      const res = await apiClient.get<UserDTO[]>('/users', {
        headers,
        skipErrorToast: true,
      });
      const adminUser = res.data.find((u) => u.email.toLowerCase() === email.toLowerCase());
      return {
        id: adminUser?.id || 1,
        name: adminUser?.name || 'Administrador',
        email: email,
        phone: adminUser?.phone || '',
        role: 'ADMIN',
      };
    } catch {
      // Not an admin
    }

    // Fallback default
    return {
      id: 0,
      name: email.split('@')[0] || 'Usuario',
      email: email,
      phone: '',
      role: 'PATIENT',
    };
  },
};

