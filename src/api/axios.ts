import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://korix-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  // NOTE: withCredentials is intentionally NOT set here.
  // The backend is on a different domain (onrender.com vs vercel.app), so
  // HTTP-only cookies are blocked as third-party cookies by all modern browsers.
  // We use localStorage + request body for the refresh token instead.
});

// Intercept requests to attach Access Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth endpoints that should NEVER trigger the token-refresh / force-logout logic.
// A 401 on these routes means "wrong credentials" or "not verified" — not an expired session.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/logout', '/auth/verify-email'];

// Intercept responses to handle 401s and refresh the token transparently
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url as string | undefined;

    const isRefreshRequest = typeof requestUrl === 'string' && requestUrl.includes('/auth/refresh');
    // Auth endpoint 401s (wrong password, email not verified, etc.) must be passed straight
    // through to the calling code — don't try to refresh or force-redirect.
    const isAuthEndpoint = typeof requestUrl === 'string' &&
      AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

    // If it's a 401 Unauthorized, haven't already retried, and it's NOT a refresh/auth request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const storedRefreshToken = localStorage.getItem('refresh_token');
        if (!storedRefreshToken) {
          throw new Error('No refresh token available');
        }

        // Send refresh token in the request body (cross-domain safe, no cookie needed)
        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: storedRefreshToken,
        });

        // Rotate both tokens
        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;
        localStorage.setItem('access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is dead/missing — clear session and send user to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('korix_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
