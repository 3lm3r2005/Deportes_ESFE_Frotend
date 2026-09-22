import axios from 'axios';
import { env } from '../schemas/env.schema';

const api = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
});

export default api;