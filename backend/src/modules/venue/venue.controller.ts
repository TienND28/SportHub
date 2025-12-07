import { FastifyRequest, FastifyReply } from "fastify";
import { VenueService } from "./venue.service";
import {
  GetAllVenuesQueryDto,
  CreateVenueDto,
  UpdateVenueDto,
  SearchVenuesQueryDto,
  VenueIdParamDto,
  OwnerIdParamDto,
} from "./venue.dto";
import { timeStringToDate, validateTimeRange } from "../../utils/time";

export class VenueController {
  private venueService: VenueService;

  constructor() {
    this.venueService = new VenueService();

    // Bind methods to preserve 'this' context and fix TypeScript strict type checking
    this.getAllVenues = this.getAllVenues.bind(this);
    this.getVenueById = this.getVenueById.bind(this);
    this.getVenuesByOwnerId = this.getVenuesByOwnerId.bind(this);
    this.createVenue = this.createVenue.bind(this);
    this.updateVenue = this.updateVenue.bind(this);
    this.deleteVenue = this.deleteVenue.bind(this);
    this.searchVenues = this.searchVenues.bind(this);
  }

  /**
   * GET /api/venues
   * Lấy danh sách venues với phân trang, filter, search, sort
   */
  getAllVenues = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = req.user;
      const query = req.query as GetAllVenuesQueryDto; // Already validated by middleware

      // Build filters
      const filters: any = {
        page: query.page || 1,
        limit: query.limit || 10,
      };

      // Search
      if (query.search) {
        filters.search = query.search.trim();
      }

      // Filter by active status
      if (query.is_active !== undefined) {
        filters.is_active = query.is_active === "true";
      }

      // Filter by maintenance status
      if (query.is_under_maintenance !== undefined) {
        filters.is_under_maintenance = query.is_under_maintenance === "true";
      }

      // Filter by location
      if (query.province_id) {
        filters.province_id = query.province_id;
      }

      if (query.district_id) {
        filters.district_id = query.district_id;
      }

      if (query.ward_id) {
        filters.ward_id = query.ward_id;
      }

      // Filter by owner (chỉ admin)
      if (query.owner_id) {
        if (!user || user.role !== "admin") {
          return reply.status(403).send({
            success: false,
            message: "Chỉ admin mới có thể filter theo owner_id",
          });
        }
        filters.owner_id = query.owner_id;
      }

      // Sort
      if (query.sortBy) {
        filters.sortBy = query.sortBy;
      }

      if (query.sortOrder) {
        filters.sortOrder = query.sortOrder;
      }

      // Apply role-based filtering
      if (!user) {
        filters.is_active = true;
      } else if (user.role === "customer") {
        filters.is_active = true;
      } else if (user.role === "owner") {
        filters.owner_id = user.id;
      }

      const result = await this.venueService.getAllVenues(filters);

      return reply.status(200).send({
        success: true,
        message: "Lấy danh sách sân thành công",
        data: result.venues,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error getting venues:", error);
      return reply.status(500).send({
        success: false,
        message: "Lỗi khi lấy danh sách sân",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  };

  /**
   * GET /api/venues/:id
   * Lấy thông tin chi tiết một venue
   */
  getVenueById = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = req.user;
      const { id } = req.params as VenueIdParamDto; // Already validated by middleware

      const venue = await this.venueService.getVenueById(id);

      if (!venue) {
        return reply.status(404).send({
          success: false,
          message: "Không tìm thấy sân",
        });
      }

      // Admin: xem tất cả
      if (user?.role === "admin") {
        return reply.status(200).send({
          success: true,
          message: "Lấy thông tin sân thành công",
          data: venue,
        });
      }

      // Owner: chỉ xem sân của mình
      if (user?.role === "owner") {
        if (venue.owner_id !== user.id) {
          return reply.status(403).send({
            success: false,
            message: "Bạn không có quyền xem sân này",
          });
        }

        return reply.status(200).send({
          success: true,
          message: "Lấy thông tin sân thành công",
          data: venue,
        });
      }

      // Customer hoặc public: chỉ xem venue active
      if (!venue.is_active) {
        return reply.status(404).send({
          success: false,
          message: "Không tìm thấy sân",
        });
      }

      return reply.status(200).send({
        success: true,
        message: "Lấy thông tin sân thành công",
        data: venue,
      });
    } catch (error) {
      console.error("Error getting venue:", error);
      return reply.status(500).send({
        success: false,
        message: "Lỗi khi lấy thông tin sân",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  };

  /**
   * GET /api/venues/owner/:ownerId
   * Lấy danh sách venues của một owner với phân trang
   */
  getVenuesByOwnerId = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = req.user!; // Already checked by authMiddleware
      const { ownerId } = req.params as OwnerIdParamDto; // Already validated
      const query = req.query as GetAllVenuesQueryDto; // Already validated

      // Chỉ admin hoặc chính owner đó mới xem được
      if (user.role !== "admin" && user.id !== ownerId) {
        return reply.status(403).send({
          success: false,
          message: "Bạn không có quyền xem danh sách sân của chủ sân này",
        });
      }

      // Build filters
      const filters: any = {
        page: query.page || 1,
        limit: query.limit || 10,
      };

      if (query.search) {
        filters.search = query.search.trim();
      }

      if (query.is_active !== undefined) {
        filters.is_active = query.is_active === "true";
      }

      if (query.sortBy) {
        filters.sortBy = query.sortBy;
      }

      if (query.sortOrder) {
        filters.sortOrder = query.sortOrder;
      }

      const result = await this.venueService.getVenuesByOwnerId(
        ownerId,
        filters
      );

      return reply.status(200).send({
        success: true,
        message: "Lấy danh sách sân của chủ sân thành công",
        data: result.venues,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error getting venues by owner:", error);
      return reply.status(500).send({
        success: false,
        message: "Lỗi khi lấy danh sách sân của chủ sân",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  };

  /**
   * POST /api/venues
   * Tạo venue mới
   */
  createVenue = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = req.user!; // Already checked by authMiddleware
      const body = req.body as CreateVenueDto; // Already validated by middleware

      // Chỉ owner hoặc admin mới tạo được venue
      if (user.role !== "owner" && user.role !== "admin") {
        return reply.status(403).send({
          success: false,
          message:
            "Bạn không có quyền tạo sân. Chỉ chủ sân hoặc admin mới có quyền này",
        });
      }

      // Validate time range if both provided
      if (body.opening_time && body.closing_time) {
        const timeError = validateTimeRange(
          body.opening_time,
          body.closing_time
        );
        if (timeError) {
          return reply.status(400).send({
            success: false,
            message: timeError,
          });
        }
      }

      // Convert time strings to Date
      const opening_time = body.opening_time
        ? timeStringToDate(body.opening_time)
        : undefined;
      const closing_time = body.closing_time
        ? timeStringToDate(body.closing_time)
        : undefined;

      // Build create data - only include defined values
      const createData: {
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
      } = {
        owner_id: user.id,
        name: body.name.trim(),
      };

      if (body.description) createData.description = body.description.trim();
      if (body.address) createData.address = body.address.trim();
      if (body.lat !== undefined) createData.lat = body.lat;
      if (body.lng !== undefined) createData.lng = body.lng;
      if (body.image) createData.image = body.image.trim();
      if (body.province_id) createData.province_id = body.province_id;
      if (body.district_id) createData.district_id = body.district_id;
      if (body.ward_id) createData.ward_id = body.ward_id;
      if (opening_time) createData.opening_time = opening_time;
      if (closing_time) createData.closing_time = closing_time;

      // Create venue
      const newVenue = await this.venueService.createVenue(createData);

      return reply.status(201).send({
        success: true,
        message: "Tạo sân mới thành công",
        data: newVenue,
      });
    } catch (error) {
      console.error("Error creating venue:", error);
      return reply.status(500).send({
        success: false,
        message: "Lỗi khi tạo sân mới",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  };

  /**
   * PUT /api/venues/:id
   * Cập nhật thông tin venue
   */
  updateVenue = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = req.user!; // Already checked by authMiddleware
      const { id } = req.params as VenueIdParamDto; // Already validated
      const body = req.body as UpdateVenueDto; // Already validated

      // Kiểm tra venue có tồn tại không
      const existingVenue = await this.venueService.getVenueById(id);

      if (!existingVenue) {
        return reply.status(404).send({
          success: false,
          message: "Không tìm thấy sân",
        });
      }

      // Owner chỉ cập nhật được venue của mình
      if (user.role === "owner" && existingVenue.owner_id !== user.id) {
        return reply.status(403).send({
          success: false,
          message: "Bạn không có quyền cập nhật sân này",
        });
      }

      // Admin hoặc owner có thể cập nhật
      if (user.role !== "admin" && user.role !== "owner") {
        return reply.status(403).send({
          success: false,
          message: "Bạn không có quyền cập nhật sân",
        });
      }

      // Validate time range if both provided
      if (body.opening_time && body.closing_time) {
        const timeError = validateTimeRange(
          body.opening_time,
          body.closing_time
        );
        if (timeError) {
          return reply.status(400).send({
            success: false,
            message: timeError,
          });
        }
      }

      // Build update data
      const updateData: any = {};

      if (body.name !== undefined) {
        updateData.name = body.name.trim();
      }

      if (body.description !== undefined) {
        updateData.description = body.description.trim();
      }

      if (body.address !== undefined) {
        updateData.address = body.address.trim();
      }

      if (body.lat !== undefined) {
        updateData.lat = body.lat;
      }

      if (body.lng !== undefined) {
        updateData.lng = body.lng;
      }

      if (body.image !== undefined) {
        updateData.image = body.image.trim();
      }

      if (body.is_active !== undefined) {
        updateData.is_active = body.is_active;
      }

      if (body.is_under_maintenance !== undefined) {
        updateData.is_under_maintenance = body.is_under_maintenance;
      }

      if (body.province_id !== undefined) {
        updateData.province_id = body.province_id;
      }

      if (body.district_id !== undefined) {
        updateData.district_id = body.district_id;
      }

      if (body.ward_id !== undefined) {
        updateData.ward_id = body.ward_id;
      }

      if (body.opening_time !== undefined) {
        updateData.opening_time = timeStringToDate(body.opening_time);
      }

      if (body.closing_time !== undefined) {
        updateData.closing_time = timeStringToDate(body.closing_time);
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return reply.status(400).send({
          success: false,
          message: "Không có thông tin nào để cập nhật",
        });
      }

      const updatedVenue = await this.venueService.updateVenue(id, updateData);

      return reply.status(200).send({
        success: true,
        message: "Cập nhật thông tin sân thành công",
        data: updatedVenue,
      });
    } catch (error) {
      console.error("Error updating venue:", error);
      return reply.status(500).send({
        success: false,
        message: "Lỗi khi cập nhật thông tin sân",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  };

  /**
   * DELETE /api/venues/:id
   * Xóa venue
   */
  deleteVenue = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = req.user!; // Already checked by authMiddleware
      const { id } = req.params as VenueIdParamDto; // Already validated

      // Kiểm tra venue có tồn tại không
      const existingVenue = await this.venueService.getVenueById(id);

      if (!existingVenue) {
        return reply.status(404).send({
          success: false,
          message: "Không tìm thấy sân",
        });
      }

      // Owner chỉ xóa được venue của mình
      if (user.role === "owner" && existingVenue.owner_id !== user.id) {
        return reply.status(403).send({
          success: false,
          message: "Bạn không có quyền xóa sân này",
        });
      }

      // Admin hoặc owner có thể xóa
      if (user.role !== "admin" && user.role !== "owner") {
        return reply.status(403).send({
          success: false,
          message: "Bạn không có quyền xóa sân",
        });
      }

      await this.venueService.deleteVenue(id);

      return reply.status(200).send({
        success: true,
        message: "Xóa sân thành công",
        data: null,
      });
    } catch (error) {
      console.error("Error deleting venue:", error);
      return reply.status(500).send({
        success: false,
        message: "Lỗi khi xóa sân",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  };

  /**
   * GET /api/venues/search?keyword=...
   * Tìm kiếm venues với phân trang và filter
   */
  searchVenues = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = req.user;
      const query = req.query as SearchVenuesQueryDto; // Already validated

      // Build filters
      const filters: any = {
        page: query.page || 1,
        limit: query.limit || 10,
      };

      // Location filters
      if (query.province_id) {
        filters.province_id = query.province_id;
      }

      if (query.district_id) {
        filters.district_id = query.district_id;
      }

      if (query.ward_id) {
        filters.ward_id = query.ward_id;
      }

      // Apply role-based filtering
      if (!user || user.role === "customer") {
        filters.is_active = true;
      } else if (user.role === "owner") {
        filters.owner_id = user.id;
      }

      const result = await this.venueService.searchVenues(
        query.keyword.trim(),
        filters
      );

      return reply.status(200).send({
        success: true,
        message: "Tìm kiếm sân thành công",
        data: result.venues,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error searching venues:", error);
      return reply.status(500).send({
        success: false,
        message: "Lỗi khi tìm kiếm sân",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  };
}
