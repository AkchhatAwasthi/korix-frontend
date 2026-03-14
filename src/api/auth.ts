import api from './axios';

export const authService = {
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; // { accessToken, user }
  },
  
  profile: async () => {
    const response = await api.get('/auth/profile');
    return response.data; // { user }
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  verifyEmail: async (token: string) => {
    // Note: If you have a separate verify page, it might just hit this GET endpoint
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data; 
  },

  resendVerification: async () => {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  }
};
