import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export class LocationService {
    /**
     * Get all provinces
     */
    async getAllProvinces() {
        return await prisma.provinces.findMany({
            orderBy: { code: "asc" },
            select: {
                id: true,
                code: true,
                name: true,
            },
        });
    }

    /**
     * Get districts by province ID
     */
    async getDistrictsByProvinceId(provinceId: number) {
        return await prisma.districts.findMany({
            where: { province_id: provinceId },
            orderBy: { code: "asc" },
            select: {
                id: true,
                code: true,
                name: true,
                province_id: true,
            },
        });
    }

    /**
     * Get wards by district ID
     */
    async getWardsByDistrictId(districtId: number) {
        return await prisma.wards.findMany({
            where: { district_id: districtId },
            orderBy: { code: "asc" },
            select: {
                id: true,
                code: true,
                name: true,
                district_id: true,
            },
        });
    }

    /**
     * Get province by ID
     */
    async getProvinceById(id: number) {
        return await prisma.provinces.findUnique({
            where: { id },
            select: {
                id: true,
                code: true,
                name: true,
            },
        });
    }

    /**
     * Get district by ID
     */
    async getDistrictById(id: number) {
        return await prisma.districts.findUnique({
            where: { id },
            select: {
                id: true,
                code: true,
                name: true,
                province_id: true,
                provinces: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
            },
        });
    }

    /**
     * Get ward by ID
     */
    async getWardById(id: number) {
        return await prisma.wards.findUnique({
            where: { id },
            select: {
                id: true,
                code: true,
                name: true,
                district_id: true,
                districts: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        province_id: true,
                        provinces: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Search provinces by name
     */
    async searchProvinces(keyword: string) {
        return await prisma.provinces.findMany({
            where: {
                name: {
                    contains: keyword,
                    mode: "insensitive",
                },
            },
            orderBy: { code: "asc" },
            select: {
                id: true,
                code: true,
                name: true,
            },
        });
    }

    /**
     * Search districts by name
     */
    async searchDistricts(keyword: string, provinceId?: number) {
        return await prisma.districts.findMany({
            where: {
                name: {
                    contains: keyword,
                    mode: "insensitive",
                },
                ...(provinceId && { province_id: provinceId }),
            },
            orderBy: { code: "asc" },
            select: {
                id: true,
                code: true,
                name: true,
                province_id: true,
                provinces: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    /**
     * Search wards by name
     */
    async searchWards(keyword: string, districtId?: number) {
        return await prisma.wards.findMany({
            where: {
                name: {
                    contains: keyword,
                    mode: "insensitive",
                },
                ...(districtId && { district_id: districtId }),
            },
            orderBy: { code: "asc" },
            select: {
                id: true,
                code: true,
                name: true,
                district_id: true,
                districts: {
                    select: {
                        id: true,
                        name: true,
                        provinces: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Get full location hierarchy (province -> district -> ward)
     */
    async getFullLocationHierarchy(
        provinceId?: number,
        districtId?: number,
        wardId?: number
    ) {
        const result: any = {};

        if (wardId) {
            const ward = await this.getWardById(wardId);
            if (ward) {
                result.ward = ward;
                result.district = ward.districts;
                result.province = ward.districts.provinces;
            }
        } else if (districtId) {
            const district = await this.getDistrictById(districtId);
            if (district) {
                result.district = district;
                result.province = district.provinces;
            }
        } else if (provinceId) {
            const province = await this.getProvinceById(provinceId);
            if (province) {
                result.province = province;
            }
        }

        return result;
    }
}