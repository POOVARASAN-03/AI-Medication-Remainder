import axios from 'axios';

// Log the API URL for debugging
const apiUrl = import.meta.env.VITE_API_URL || 'https://ai-medication-api.onrender.com';
console.log('🔗 API Base URL:', apiUrl);

const API = axios.create({
  baseURL: apiUrl,
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem('userInfo')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`;
  }
  console.log(`📡 API Request: ${req.method?.toUpperCase()} ${req.baseURL}${req.url}`);
  return req;
});

API.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error);
  }
);

export default API;
