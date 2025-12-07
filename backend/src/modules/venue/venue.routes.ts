import { FastifyInstance } from "fastify";
import { VenueController } from "./venue.controller";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../../middlewares/auth.middleware";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../middlewares/validation.middleware";
import {
  GetAllVenuesQueryDto,
  CreateVenueDto,
  UpdateVenueDto,
  SearchVenuesQueryDto,
  VenueIdParamDto,
  OwnerIdParamDto,
} from "./venue.dto";

const venueController = new VenueController();

export default async function venueRoutes(fastify: FastifyInstance) {
  // ============== PUBLIC / CUSTOMER ROUTES ==============

  /**
   * GET /api/venues
   * Lấy danh sách venues với phân trang, filter, sort
   */
  fastify.get(
    "/",
    {
      preHandler: [optionalAuthMiddleware, validateQuery(GetAllVenuesQueryDto)],
    },
    venueController.getAllVenues
  );

  /**
   * GET /api/venues/search?keyword=...
   * Tìm kiếm venues
   */
  fastify.get(
    "/search",
    {
      preHandler: [optionalAuthMiddleware, validateQuery(SearchVenuesQueryDto)],
    },
    venueController.searchVenues
  );

  /**
   * GET /api/venues/:id
   * Lấy chi tiết một venue
   */
  fastify.get(
    "/:id",
    {
      preHandler: [optionalAuthMiddleware, validateParams(VenueIdParamDto)],
    },
    venueController.getVenueById
  );

  // ============== AUTHENTICATED ROUTES ==============

  /**
   * GET /api/venues/owner/:ownerId
   * Lấy danh sách venues của một owner
   */
  fastify.get(
    "/owner/:ownerId",
    {
      preHandler: [
        authMiddleware,
        validateParams(OwnerIdParamDto),
        validateQuery(GetAllVenuesQueryDto),
      ],
    },
    venueController.getVenuesByOwnerId
  );

  /**
   * POST /api/venues
   * Tạo venue mới
   */
  fastify.post(
    "/",
    {
      preHandler: [authMiddleware, validateBody(CreateVenueDto)],
    },
    venueController.createVenue
  );

  /**
   * PUT /api/venues/:id
   * Cập nhật thông tin venue
   */
  fastify.put(
    "/:id",
    {
      preHandler: [
        authMiddleware,
        validateParams(VenueIdParamDto),
        validateBody(UpdateVenueDto),
      ],
    },
    venueController.updateVenue
  );

  /**
   * DELETE /api/venues/:id
   * Xóa venue
   */
  fastify.delete(
    "/:id",
    {
      preHandler: [authMiddleware, validateParams(VenueIdParamDto)],
    },
    venueController.deleteVenue
  );
}
