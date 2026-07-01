import axios from 'axios';
import { getItem } from './storage';

import { Platform } from 'react-native';

const LOCAL_API = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://localhost:8080/api/v1';
const API_BASE_URL =
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || LOCAL_API;

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Attach Bearer token automatically on every request
apiClient.interceptors.request.use((config) => {
    const token = getItem<string>('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

interface ApiErrorBody {
    code?: string;
    message?: string;
}

export function getApiErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra'): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiErrorBody | undefined;
        if (data?.message) {
            return data.message;
        }
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}
