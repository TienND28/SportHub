import { apiClient } from '../lib/axios';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    role: string;
    avatar: string | null;
    date_of_birth: string | null;
    gender: string | null;
    favorite_sports: string[];
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
    };
}

class AuthService {
    async login(data: LoginRequest): Promise<AuthResponse> {
        return apiClient.post('/api/auth/login', data);
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        return apiClient.post('/api/auth/register', data);
    }

    async logout(): Promise<void> {
        return apiClient.post('/api/auth/logout');
    }

    async refreshToken(): Promise<AuthResponse> {
        return apiClient.post('/api/auth/refresh');
    }
}

export const authService = new AuthService();
