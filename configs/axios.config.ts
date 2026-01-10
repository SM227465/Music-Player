import axios from 'axios';

const API_BASE_URL = 'https://saavn.sumit.co/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', {
        url: error.config?.url,
        message: 'No response received from server',
      });
    } else {
      // Request setup error
      console.error('Request Error:', error.message);
    }

    // Always reject the error so it can be handled by the caller
    return Promise.reject(error);
  }
);
