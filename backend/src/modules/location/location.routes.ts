import { FastifyInstance } from "fastify";
import { LocationController } from "./location.controller";

const locationController = new LocationController();

export default async function locationRoutes(fastify: FastifyInstance) {
    // ============== PROVINCES ==============
    fastify.get("/provinces", locationController.getAllProvinces);
    fastify.get("/provinces/:id", locationController.getProvinceById);
    fastify.get("/provinces/:provinceId/districts", locationController.getDistrictsByProvinceId);

    // ============== DISTRICTS ==============
    fastify.get("/districts/:id", locationController.getDistrictById);
    fastify.get("/districts/:districtId/wards", locationController.getWardsByDistrictId);

    // ============== WARDS ==============
    fastify.get("/wards/:id", locationController.getWardById);

    // ============== SEARCH ==============
    fastify.get("/search/provinces", locationController.searchProvinces);
    fastify.get("/search/districts", locationController.searchDistricts);
    fastify.get("/search/wards", locationController.searchWards);

    // ============== HIERARCHY ==============
    fastify.get("/hierarchy", locationController.getFullLocationHierarchy);
}
