import axios from 'axios';

// Use local development server or staging based on environment
// Check both NODE_ENV and if we're running on localhost
const isLocalDevelopment = process.env.NODE_ENV === 'development' || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

const API_BASE_URL = isLocalDevelopment
  ? 'http://localhost:8000/api'
  : 'https://staging-runmate-backend-production.up.railway.app/api';

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

// Helper function to convert relative image URLs to full backend URLs
export const getFullImageUrl = (imageSrc) => {
  if (!imageSrc) return null;
  
  // Skip ui-avatars.com URLs and other external URLs
  if (imageSrc.includes('ui-avatars.com') || imageSrc.includes('unsplash.com') || imageSrc.includes('images.')) {
    return imageSrc;
  }
  
  // If it's already a full URL, return as is
  if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
    return imageSrc;
  }
  
  // If it's a relative URL starting with /uploads, convert to full backend URL
  if (imageSrc.startsWith('/uploads/')) {
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://staging-runmate-backend-production.up.railway.app'
      : 'http://localhost:8000';
    return `${backendUrl}${imageSrc}`;
  }
  
  return imageSrc;
};

// Helper function to get profile picture with fallback
export const getProfilePictureUrl = (user) => {
  const profileSrc = user?.profilePicture || user?.profilePhoto;
  const fullUrl = getFullImageUrl(profileSrc);
  
  // Return the full URL if it exists and is not a ui-avatars URL, otherwise return null for fallback
  return fullUrl && !fullUrl.includes('ui-avatars.com') ? fullUrl : null;
};

export default apiClient; 