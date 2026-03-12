import axios from 'axios';

// Set base URL dynamically based on environment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export default api;
