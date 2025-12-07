import { FastifyRequest, FastifyReply } from "fastify";
import { LocationService } from "./location.service";

export class LocationController {
    private locationService: LocationService;

    constructor() {
        this.locationService = new LocationService();
    }

    /**
     * GET /api/locations/provinces
     * Get all provinces
     */
    getAllProvinces = async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const provinces = await this.locationService.getAllProvinces();

            return reply.status(200).send({
                success: true,
                message: "Lấy danh sách tỉnh/thành phố thành công",
                data: provinces,
            });
        } catch (error) {
            console.error("Error getting provinces:", error);
            return reply.status(500).send({
                success: false,
                message: "Lỗi khi lấy danh sách tỉnh/thành phố",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * GET /api/locations/provinces/:id
     * Get province by ID
     */
    getProvinceById = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return reply.status(400).send({
                    success: false,
                    message: "ID tỉnh/thành phố không hợp lệ",
                });
            }

            const province = await this.locationService.getProvinceById(id);

            if (!province) {
                return reply.status(404).send({
                    success: false,
                    message: "Không tìm thấy tỉnh/thành phố",
                });
            }

            return reply.status(200).send({
                success: true,
                message: "Lấy thông tin tỉnh/thành phố thành công",
                data: province,
            });
        } catch (error) {
            console.error("Error getting province:", error);
            return reply.status(500).send({
                success: false,
                message: "Lỗi khi lấy thông tin tỉnh/thành phố",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * GET /api/locations/provinces/:provinceId/districts
     * Get districts by province ID
     */
    getDistrictsByProvinceId = async (
        req: FastifyRequest<{ Params: { provinceId: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const provinceId = parseInt(req.params.provinceId);

            if (isNaN(provinceId)) {
                return reply.status(400).send({
                    success: false,
                    message: "ID tỉnh/thành phố không hợp lệ",
                });
            }

            const districts = await this.locationService.getDistrictsByProvinceId(provinceId);

            return reply.status(200).send({
                success: true,
                message: "Lấy danh sách quận/huyện thành công",
                data: districts,
            });
        } catch (error) {
            console.error("Error getting districts:", error);
            return reply.status(500).send({
                success: false,
                message: "Lỗi khi lấy danh sách quận/huyện",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * GET /api/locations/districts/:id
     * Get district by ID
     */
    getDistrictById = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return reply.status(400).send({
                    success: false,
                    message: "ID quận/huyện không hợp lệ",
                });
            }

            const district = await this.locationService.getDistrictById(id);

            if (!district) {
                return reply.status(404).send({
                    success: false,
                    message: "Không tìm thấy quận/huyện",
                });
            }

            return reply.status(200).send({
                success: true,
                message: "Lấy thông tin quận/huyện thành công",
                data: district,
            });
        } catch (error) {
            console.error("Error getting district:", error);
            return reply.status(500).send({
                success: false,
                message: "Lỗi khi lấy thông tin quận/huyện",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * GET /api/locations/districts/:districtId/wards
     * Get wards by district ID
     */
    getWardsByDistrictId = async (
        req: FastifyRequest<{ Params: { districtId: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const districtId = parseInt(req.params.districtId);

            if (isNaN(districtId)) {
                return reply.status(400).send({
                    success: false,
                    message: "ID quận/huyện không hợp lệ",
                });
            }

            const wards = await this.locationService.getWardsByDistrictId(districtId);

            return reply.status(200).send({
                success: true,
                message: "Lấy danh sách phường/xã thành công",
                data: wards,
            });
        } catch (error) {
            console.error("Error getting wards:", error);
            return reply.status(500).send({
                success: false,
                message: "Lỗi khi lấy danh sách phường/xã",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * GET /api/locations/wards/:id
     * Get ward by ID
     */
    getWardById = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return reply.status(400).send({
                    success: false,
                    message: "ID phường/xã không hợp lệ",
                });
            }

            const ward = await this.locationService.getWardById(id);

            if (!ward) {
                return reply.status(404).send({
                    success: false,
                    message: "Không tìm thấy phường/xã",
                });
            }

            return reply.status(200).send({
                success: true,
                message: "Lấy thông tin phường/xã thành công",
                data: ward,
            });
        } catch (error) {
            console.error("Error getting ward:", error);
            return reply.status(500).send({
                success: false,
                message: "Lỗi khi lấy thông tin phường/xã",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * GET /api/locations/search/provinces?keyword=...
     * Search provinces by name
     */
    searchProvinces = async (
        req: FastifyRequest<{ Querystring: { keyword: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const keyword = req.query.keyword;

            if (!keyword || keyword.trim() === "") {
                return reply.status(400).send({
                    success: false,
                    message: "Từ khóa tìm kiếm không được để trống",
                });
            }

            const provinces = await this.locationService.searchProvinces(keyword);

            return reply.status(200).send({
                success: true,
                message: "Tìm kiếm tỉnh/thành phố thành công",
                data: provinces,
            });
        } catch (error) {
            console.error("Error searching provinces:", error);
            return reply.status(500).send({
                success: false,
                message: "Lỗi khi tìm kiếm tỉnh/thành phố",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * GET /api/locations/search/districts?keyword=...&provinceId=...
     * Search districts by name
     */
    searchDistricts = async (
        req: FastifyRequest<{ Querystring: { keyword: string; provinceId?: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const keyword = req.query.keyword;
            const provinceId = req.query.provinceId ? parseInt(req.query.provinceId) : undefined;

            if (!keyword || keyword.trim() === "") {
                return reply.status(400).send({
                    success: false,
                    message: "Từ khóa tìm kiếm không được để trống",
                });
            }

            const districts = await this.locationService.searchDistricts(keyword, provinceId);

            return reply.status(200).send({
                success: true,
                message: "Tìm kiếm quận/huyện thành công",
                data: districts,
            });
        } catch (error) {
            console.error("Error searching districts:", error);
            return reply.status(500).send({
                success: false,
                message: "Lỗi khi tìm kiếm quận/huyện",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * GET /api/locations/search/wards?keyword=...&districtId=...
     * Search wards by name
     */
    searchWards = async (
        req: FastifyRequest<{ Querystring: { keyword: string; districtId?: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const keyword = req.query.keyword;
            const districtId = req.query.districtId ? parseInt(req.query.districtId) : undefined;

            if (!keyword || keyword.trim() === "") {
                return reply.status(400).send({
                    success: false,
                    message: "Từ khóa tìm kiếm không được để trống",
                });
            }

            const wards = await this.locationService.searchWards(keyword, districtId);

            return reply.status(200).send({
                success: true,
                message: "Tìm kiếm phường/xã thành công",
                data: wards,
            });
        } catch (error) {
            console.error("Error searching wards:", error);
            return reply.status(500).send({
                success: false,
                message: "Lỗi khi tìm kiếm phường/xã",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * GET /api/locations/hierarchy?provinceId=...&districtId=...&wardId=...
     * Get full location hierarchy
     */
    getFullLocationHierarchy = async (
        req: FastifyRequest<{ Querystring: { provinceId?: string; districtId?: string; wardId?: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const provinceId = req.query.provinceId ? parseInt(req.query.provinceId) : undefined;
            const districtId = req.query.districtId ? parseInt(req.query.districtId) : undefined;
            const wardId = req.query.wardId ? parseInt(req.query.wardId) : undefined;

            const hierarchy = await this.locationService.getFullLocationHierarchy(
                provinceId,
                districtId,
                wardId
            );

            return reply.status(200).send({
                success: true,
                message: "Lấy thông tin địa điểm thành công",
                data: hierarchy,
            });
        } catch (error) {
            console.error("Error getting location hierarchy:", error);
            return reply.status(500).send({
                success: false,
                message: "Lỗi khi lấy thông tin địa điểm",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };
}
