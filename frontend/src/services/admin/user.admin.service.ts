import { apiClient } from '../../lib/axios';

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

export interface GetAllUsersParams {
    search?: string;
    role?: string;
    gender?: string;
    is_verified?: string;
    is_active?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface PaginatedUsersResponse {
    success: boolean;
    data: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

class AdminService {
    /**
     * Get all users with filtering, sorting, and pagination
     */
    async getAllUsers(params: GetAllUsersParams): Promise<PaginatedUsersResponse> {
        // Remove empty string values to avoid filtering
        const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== '' && value !== undefined && value !== null) {
                acc[key] = value;
            }
            return acc;
        }, {} as any);

        return apiClient.get('/api/users/admin/all', { params: cleanParams });
    }

    /**
     * Update user role
     */
    async updateUserRole(userId: string, role: string): Promise<{ success: boolean; data: User }> {
        return apiClient.put(`/api/users/admin/${userId}/role`, { role });
    }

    /**
     * Delete user
     */
    async deleteUser(userId: string): Promise<{ success: boolean }> {
        return apiClient.delete(`/api/users/admin/${userId}`);
    }

    /**
     * Toggle user active status
     */
    async toggleUserStatus(userId: string): Promise<{ success: boolean; data: User }> {
        return apiClient.patch(`/api/users/admin/${userId}/toggle-status`);
    }

    /**
     * Toggle user verified status
     */
    async toggleUserVerified(userId: string): Promise<{ success: boolean; data: User }> {
        return apiClient.patch(`/api/users/admin/${userId}/toggle-verified`);
    }
}

export const adminService = new AdminService();
