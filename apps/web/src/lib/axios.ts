import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data.data,
  (err) => {
    const message = err.response?.data?.message ?? '오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  },
);

export default api;
