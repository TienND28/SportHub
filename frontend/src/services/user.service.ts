import { apiClient } from '../lib/axios';

export interface UpdateProfileData {
    full_name?: string;
    phone?: string;
    date_of_birth?: string; // ISO date string
    gender?: 'male' | 'female' | 'other';
    avatar?: string;
    favorite_sports?: string[];
}

export interface UserResponse {
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

class UserService {
    async getProfile(): Promise<{ success: boolean; data: UserResponse }> {
        return apiClient.get('/api/users/profile');
    }

    async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; data: UserResponse }> {
        return apiClient.put('/api/users/profile', data);
    }

    async changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
        return apiClient.put('/api/users/password', data);
    }
}

export const userService = new UserService();
