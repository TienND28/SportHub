import { Prisma } from "../../generated/prisma";
import prisma from "../../config/database";
import { PaginationMeta } from "./venue.dto";

/**
 * Interface cho filters
 */
interface VenueFilters {
    search?: string;
    is_active?: boolean;
    is_under_maintenance?: boolean;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    owner_id?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
}

/**
 * Response type cho getAllVenues
 */
interface GetAllVenuesResponse {
    venues: any[];
    pagination: PaginationMeta;
}

export class VenueService {
    /**
     * Lấy danh sách venues với phân trang và filter
     */
    async getAllVenues(
        filters: VenueFilters = {}
    ): Promise<GetAllVenuesResponse> {
        const {
            search,
            is_active,
            is_under_maintenance,
            province_id,
            district_id,
            ward_id,
            owner_id,
            sortBy = "created_at",
            sortOrder = "desc",
            page = 1,
            limit = 10,
        } = filters;

        // Build where clause
        const where: Prisma.venuesWhereInput = {};

        // Search by name
        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive",
            };
        }

        // Filter by active status
        if (is_active !== undefined) {
            where.is_active = is_active;
        }

        // Filter by maintenance status
        if (is_under_maintenance !== undefined) {
            where.is_under_maintenance = is_under_maintenance;
        }

        // Filter by location
        if (province_id) {
            where.province_id = province_id;
        }

        if (district_id) {
            where.district_id = district_id;
        }

        if (ward_id) {
            where.ward_id = ward_id;
        }

        // Filter by owner
        if (owner_id) {
            where.owner_id = owner_id;
        }

        // Build orderBy clause
        const orderBy: Prisma.venuesOrderByWithRelationInput = {};

        if (sortBy === "name") {
            orderBy.name = sortOrder;
        } else if (sortBy === "created_at") {
            orderBy.created_at = sortOrder;
        } else if (sortBy === "updated_at") {
            orderBy.updated_at = sortOrder;
        } else {
            orderBy.created_at = sortOrder;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;
        const take = limit;

        // Get total count
        const totalItems = await prisma.venues.count({ where });

        // Get venues
        const venues = await prisma.venues.findMany({
            where,
            orderBy,
            skip,
            take,
            select: {
                id: true,
                owner_id: true,
                name: true,
                description: true,
                address: true,
                lat: true,
                lng: true,
                image: true,
                is_active: true,
                is_under_maintenance: true,
                province_id: true,
                district_id: true,
                ward_id: true,
                created_at: true,
                updated_at: true,
                opening_time: true,
                closing_time: true,
                provinces: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                districts: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                wards: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                users: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalItems / limit);
        const pagination: PaginationMeta = {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return {
            venues,
            pagination,
        };
    }

    /**
     * Lấy venue theo ID
     */
    async getVenueById(id: string) {
        return await prisma.venues.findUnique({
            where: { id },
            select: {
                id: true,
                owner_id: true,
                name: true,
                description: true,
                address: true,
                lat: true,
                lng: true,
                image: true,
                is_active: true,
                is_under_maintenance: true,
                province_id: true,
                district_id: true,
                ward_id: true,
                created_at: true,
                updated_at: true,
                opening_time: true,
                closing_time: true,
                provinces: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                districts: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                wards: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                users: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
    }

    /**
     * Lấy venues theo owner ID
     */
    async getVenuesByOwnerId(
        ownerId: string,
        filters: VenueFilters = {}
    ): Promise<GetAllVenuesResponse> {
        // Add owner_id to filters
        const filtersWithOwner = {
            ...filters,
            owner_id: ownerId,
        };

        return await this.getAllVenues(filtersWithOwner);
    }

    /**
     * Tạo venue mới
     */
    async createVenue(data: {
        owner_id: string;
        name: string;
        description?: string;
        address?: string;
        lat?: number;
        lng?: number;
        image?: string;
        province_id?: number;
        district_id?: number;
        ward_id?: number;
        opening_time?: Date;
        closing_time?: Date;
    }) {
        return await prisma.venues.create({
            data,
            select: {
                id: true,
                owner_id: true,
                name: true,
                description: true,
                address: true,
                lat: true,
                lng: true,
                image: true,
                is_active: true,
                is_under_maintenance: true,
                province_id: true,
                district_id: true,
                ward_id: true,
                created_at: true,
                updated_at: true,
                opening_time: true,
                closing_time: true,
                provinces: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                districts: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                wards: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                users: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
    }

    /**
     * Cập nhật venue
     */
    async updateVenue(
        id: string,
        data: {
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
            opening_time?: Date;
            closing_time?: Date;
        }
    ) {
        return await prisma.venues.update({
            where: { id },
            data,
            select: {
                id: true,
                owner_id: true,
                name: true,
                description: true,
                address: true,
                lat: true,
                lng: true,
                image: true,
                is_active: true,
                is_under_maintenance: true,
                province_id: true,
                district_id: true,
                ward_id: true,
                created_at: true,
                updated_at: true,
                opening_time: true,
                closing_time: true,
                provinces: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                districts: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                wards: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                users: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
    }

    /**
     * Xóa venue
     */
    async deleteVenue(id: string) {
        return await prisma.venues.delete({
            where: { id },
        });
    }

    /**
     * Tìm kiếm venues với phân trang
     */
    async searchVenues(
        keyword: string,
        filters: VenueFilters = {}
    ): Promise<GetAllVenuesResponse> {
        // Add search keyword to filters
        const filtersWithSearch = {
            ...filters,
            search: keyword,
        };

        return await this.getAllVenues(filtersWithSearch);
    }
}
