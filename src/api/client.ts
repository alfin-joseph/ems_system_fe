import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Request new access token
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============ Auth APIs ============
export const authAPI = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
  }) => apiClient.post('/register/', data),

  login: (username: string, password: string) =>
    apiClient.post('/token/', { username, password }),

  refreshToken: (refresh: string) =>
    apiClient.post('/token/refresh/', { refresh }),

  changePassword: (oldPassword: string, newPassword: string, newPassword2: string) =>
    apiClient.post('/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    }),

  testProtected: () => apiClient.get('/protected/'),
};

// ============ Employee APIs ============
export const employeeAPI = {
  getAll: () => apiClient.get('/employees/'),

  getById: (id: number) => apiClient.get(`/employees/${id}/`),

  create: (data: any) => apiClient.post('/employees/', data),

  update: (id: number, data: any) => apiClient.put(`/employees/${id}/`, data),

  delete: (id: number) => apiClient.delete(`/employees/${id}/`),
};

// ============ Field Definition APIs ============
export const fieldDefinitionAPI = {
  getAll: () => apiClient.get('/employee-field-definitions/'),

  getById: (id: number) => apiClient.get(`/employee-field-definitions/${id}/`),

  create: (data: any) => apiClient.post('/employee-field-definitions/', data),

  update: (id: number, data: any) => apiClient.put(`/employee-field-definitions/${id}/`, data),

  delete: (id: number) => apiClient.delete(`/employee-field-definitions/${id}/`),
};

// ============ Token Management ============
export const tokenAPI = {
  saveTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  getAccessToken: () => localStorage.getItem('access_token'),

  getRefreshToken: () => localStorage.getItem('refresh_token'),

  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isTokenValid: () => {
    return !!localStorage.getItem('access_token');
  },
};

export default apiClient;
