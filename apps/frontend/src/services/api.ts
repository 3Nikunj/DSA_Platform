import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    // Add authorization header if token exists
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      } catch {
        // Ignore parsing errors
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const { useAuthStore } = await import('../stores/authStore');
        await useAuthStore.getState().refreshToken();
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        const { useAuthStore } = await import('../stores/authStore');
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    } else {
      // Handle other HTTP errors
      const message = error.response.data?.message || 'An error occurred';
      
      // Don't show toast for certain status codes that are handled elsewhere
      if (![401, 422].includes(error.response.status)) {
        toast.error(message);
      }
    }

    return Promise.reject(error);
  }
);

// API Service Classes
export class AuthService {
  static async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  static async register(data: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  static async refreshToken(token: string) {
    const response = await api.post('/auth/refresh', { token });
    return response.data;
  }

  static async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  static async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  static async resetPassword(token: string, password: string) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }
}

export class UserService {
  static async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  }

  static async updateProfile(data: Partial<{
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    avatar?: string;
  }>) {
    const response = await api.put('/users/profile', data);
    return response.data;
  }

  static async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async getStats() {
    const response = await api.get('/users/me/statistics');
    return response.data;
  }

  static async getLeaderboard(limit = 10) {
    const response = await api.get(`/users/leaderboard/xp?limit=${limit}`);
    return response.data;
  }
}

export class AlgorithmService {
  static async getAlgorithms(params?: {
    category?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/algorithms', { params });
    return response.data;
  }

  static async getAlgorithm(id: string) {
    const response = await api.get(`/algorithms/${id}`);
    return response.data;
  }

  static async getCategories() {
    const response = await api.get('/algorithms/categories');
    return response.data;
  }

  static async markAsCompleted(algorithmId: string, timeSpent: number) {
    const response = await api.post(`/algorithms/${algorithmId}/complete`, {
      timeSpent,
    });
    return response.data;
  }

  static async submitCode(algorithmId: string, code: string, language: string) {
    const response = await api.post(`/algorithms/${algorithmId}/submit`, {
      code,
      language,
    });
    return response.data;
  }
}

export class ProgressService {
  static async getProgress(algorithmId?: string) {
    const url = algorithmId ? `/progress/${algorithmId}` : '/progress';
    const response = await api.get(url);
    return response.data;
  }

  static async updateProgress(algorithmId: string, data: {
    completed?: boolean;
    timeSpent?: number;
    attempts?: number;
  }) {
    const response = await api.put(`/progress/${algorithmId}`, data);
    return response.data;
  }

  static async getAchievements() {
    const response = await api.get('/progress/achievements');
    return response.data;
  }
}

export class ChallengeService {
  static async getChallenges(params?: {
    difficulty?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/challenges', { params });
    return response.data;
  }

  static async getChallenge(id: string) {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  }

  static async submitSolution(challengeId: string, data: {
    code: string;
    language: string;
  }) {
    const response = await api.post(`/challenges/${challengeId}/submit`, data);
    return response.data;
  }

  static async getSubmissions(challengeId: string) {
    const response = await api.get(`/challenges/${challengeId}/submissions`);
    return response.data;
  }
}

// Export default api instance
export default api;