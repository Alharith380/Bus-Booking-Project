import { create } from 'axios';

import { getAuthToken } from '@/services/secure-storage';

export const apiClient = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (!process.env.EXPO_PUBLIC_API_URL?.trim()) {
    throw new Error('EXPO_PUBLIC_API_URL must be set before making API requests.');
  }

  const token = await getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
