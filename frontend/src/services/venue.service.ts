import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Venue {
    id: string;
    owner_id: string;
    name: string;
    description?: string;
    address?: string;
    lat?: number;
    lng?: number;
    image?: string;
    is_active: boolean;
    is_under_maintenance: boolean;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    opening_time?: string;
    closing_time?: string;
    created_at: string;
    updated_at: string;
    provinces?: {
        id: number;
        code: string;
        name: string;
    };
    districts?: {
        id: number;
        code: string;
        name: string;
    };
    wards?: {
        id: number;
        code: string;
        name: string;
    };
    users?: {
        id: string;
        full_name: string;
        email: string;
        phone?: string;
    };
}

export interface VenueFilters {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    is_under_maintenance?: boolean;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    owner_id?: string;
    sortBy?: "name" | "created_at" | "updated_at";
    sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface VenuesResponse {
    success: boolean;
    message: string;
    data: Venue[];
    pagination: PaginationMeta;
}

export interface VenueResponse {
    success: boolean;
    message: string;
    data: Venue;
}

export interface CreateVenueDto {
    name: string;
    description?: string;
    address?: string;
    lat?: number;
    lng?: number;
    image?: string;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    opening_time?: string;
    closing_time?: string;
}

export interface UpdateVenueDto {
    name?: string;
    description?: string;
    address?: string;
    lat?: number;
    lng?: number;
    image?: string;
    is_active?: boolean;
    is_under_maintenance?: boolean;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    opening_time?: string;
    closing_time?: string;
}

class VenueService {
    /**
     * Get all venues with filters
     */
    async getAllVenues(filters?: VenueFilters): Promise<VenuesResponse> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }

        const response = await axios.get(`${API_URL}/api/venues?${params}`, {
            withCredentials: true,
        });
        return response.data;
    }

    /**
     * Search venues by keyword
     */
    async searchVenues(
        keyword: string,
        filters?: Omit<VenueFilters, "search">
    ): Promise<VenuesResponse> {
        const params = new URLSearchParams({ keyword });
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }

        const response = await axios.get(
            `${API_URL}/api/venues/search?${params}`,
            {
                withCredentials: true,
            }
        );
        return response.data;
    }

    /**
     * Get venue by ID
     */
    async getVenueById(id: string): Promise<VenueResponse> {
        const response = await axios.get(`${API_URL}/api/venues/${id}`, {
            withCredentials: true,
        });
        return response.data;
    }

    /**
     * Get venues by owner ID
     */
    async getVenuesByOwnerId(
        ownerId: string,
        filters?: VenueFilters
    ): Promise<VenuesResponse> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }

        const response = await axios.get(
            `${API_URL}/api/venues/owner/${ownerId}?${params}`,
            {
                withCredentials: true,
            }
        );
        return response.data;
    }

    /**
     * Create a new venue
     */
    async createVenue(data: CreateVenueDto): Promise<VenueResponse> {
        const response = await axios.post(`${API_URL}/api/venues`, data, {
            withCredentials: true,
        });
        return response.data;
    }

    /**
     * Update a venue
     */
    async updateVenue(
        id: string,
        data: UpdateVenueDto
    ): Promise<VenueResponse> {
        const response = await axios.put(`${API_URL}/api/venues/${id}`, data, {
            withCredentials: true,
        });
        return response.data;
    }

    /**
     * Delete a venue
     */
    async deleteVenue(id: string): Promise<{ success: boolean; message: string }> {
        const response = await axios.delete(`${API_URL}/api/venues/${id}`, {
            withCredentials: true,
        });
        return response.data;
    }
}

export default new VenueService();
