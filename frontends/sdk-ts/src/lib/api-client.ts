import axios from 'axios';
import { getItem } from './storage';

const BASE_URL = 'http://localhost:8080';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach Bearer token automatically on every request
apiClient.interceptors.request.use((config) => {
    const token = getItem<string>('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
