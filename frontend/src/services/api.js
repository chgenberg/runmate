import axios from 'axios';

// Use environment variable or fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://runmate-production.up.railway.app/api';

// Create axios instance with timeout
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      // Don't redirect on timeout, let component handle it
    } else if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    } else if (!error.response) {
      // Network error (no response received)
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient; 