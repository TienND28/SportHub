import dotenv from "dotenv";
import fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import prisma from "./src/config/database";

// Load environment variables
dotenv.config();

// Tạo Fastify instance
const server = fastify({
    logger: true, // Simple logger
});

// Đăng ký Cookie plugin
server.register(cookie, {
    secret: process.env.COOKIE_SECRET || "my-secret-key-change-this-in-production",
    parseOptions: {} // options for parsing cookies
});

// Đăng ký CORS
server.register(cors, {
    origin: true, // Cho phép tất cả origins trong development
    credentials: true,
});

// Đăng ký Helmet cho security
server.register(helmet, {
    contentSecurityPolicy: false, // Tắt CSP cho development
});

// Health check route
server.get("/", async (request, reply) => {
    return {
        status: "ok",
        message: "SportHub Backend API is running! 🚀",
        timestamp: new Date().toISOString(),
    };
});

// Health check endpoint
server.get("/health", async (request, reply) => {
    return {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    };
});

// Database health check endpoint
server.get("/health/db", async (request, reply) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return {
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        reply.code(503);
        return {
            status: "unhealthy",
            database: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
        };
    }
});

// Start server
const start = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log("✅ Database connected successfully!");

        const PORT = process.env.PORT || 3000;
        const HOST = process.env.HOST || "0.0.0.0";

        await server.listen({ port: Number(PORT), host: HOST });

        console.log("\n🎉 Server started successfully!");
        console.log(`📍 Server is running at: http://localhost:${PORT}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        console.log(`💾 Database health: http://localhost:${PORT}/health/db\n`);
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        server.log.error(err);
        await prisma.$disconnect();
        process.exit(1);
    }
};

start();
