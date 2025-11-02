import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Generate AI review
  generateReview: async (data: {
    store_id: string;
    rating: number;
    services: string[];
    customer_feedback?: string;
  }) => {
    const response = await api.post('/api/v1/review/generate', data);
    return response.data;
  },

  // Get store information
  getStoreInfo: async (storeId: string) => {
    const response = await api.get(`/api/v1/store/${storeId}`);
    return response.data;
  },

  // Submit feedback for low ratings
  submitFeedback: async (data: {
    store_id: string;
    rating: number;
    feedback: string;
    contact_info?: string;
  }) => {
    const response = await api.post('/api/v1/review/feedback', data);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;