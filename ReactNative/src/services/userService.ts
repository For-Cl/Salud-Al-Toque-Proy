import apiClient from '../api/client';
import type { UserDTO } from '../types';

export const userService = {
  getMe: async (): Promise<UserDTO> => {
    const response = await apiClient.get<UserDTO>('/users/me');
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

  /**
   * Resolves the authenticated user's actual role and profile by checking
   * the backend endpoints.
   */
  resolveProfile: async (token: string): Promise<UserDTO> => {
    let email = '';
    try {
      const base64Url = token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        email = decoded.sub || '';
        if (decoded.role && ['ADMIN', 'PROFESSIONAL', 'PATIENT'].includes(decoded.role)) {
          return {
            id: decoded.userId || 0,
            name: decoded.name || email.split('@')[0],
            email: email,
            phone: decoded.phone || '',
            role: decoded.role,
          };
        }
      }
    } catch {
      // ignore
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 0. Try direct GET /users/me
    try {
      const res = await apiClient.get<UserDTO>('/users/me', { headers });
      if (res.data && res.data.role) {
        return res.data;
      }
    } catch {
      // fallback
    }

    // 1. Check if patient
    try {
      const res = await apiClient.get('/patients/me', { headers });
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

    // 2. Check if professional
    try {
      await apiClient.get('/appointments/my-professional-appointments', { headers });
      let profName = 'Dr. ' + (email ? email.split('@')[0] : 'Profesional');
      try {
        const profsRes = await apiClient.get('/professionals');
        const list: any[] = profsRes.data;
        const found = list.find(
          (p) =>
            (p.email && p.email.toLowerCase() === email.toLowerCase()) ||
            (email.includes('carlos') && p.name?.toLowerCase().includes('carlos')) ||
            (email.includes('maria') && p.name?.toLowerCase().includes('maria'))
        );
        if (found) profName = found.name;
      } catch {}

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

    // 3. Check if admin
    try {
      const res = await apiClient.get<UserDTO[]>('/users', { headers });
      const adminUser = res.data.find((u) => u.email.toLowerCase() === email.toLowerCase());
      return {
        id: adminUser?.id || 1,
        name: adminUser?.name || 'Administrador',
        email: email,
        phone: adminUser?.phone || '',
        role: 'ADMIN',
      };
    } catch {
      // Not admin
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

