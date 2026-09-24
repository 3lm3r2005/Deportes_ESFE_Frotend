import axios from 'axios';
import { env } from '../schemas/env.schema';

const api = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('usuario');
      if (!window.location.hash.includes('/login') && !window.location.hash.includes('/registro')) {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;