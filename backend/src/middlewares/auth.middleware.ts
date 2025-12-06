import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtUtil } from '../common/utils';
import prisma from '../config/database';

// Extend Fastify Request type to include user
declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string;
            email: string;
            role: string;
        };
    }
}

/**
 * Authentication middleware using JwtUtil
 * Verifies JWT token from Authorization header or cookies
 */
export async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        let token: string | null = null;

        // Try to get token from Authorization header first
        token = JwtUtil.extractTokenFromHeader(request.headers.authorization);

        // If not in header, try cookies
        if (!token && request.cookies.jwt) {
            token = request.cookies.jwt;
        }

        if (!token) {
            return reply.status(401).send({
                success: false,
                message: 'No authentication token provided'
            });
        }

        // Verify token using JwtUtil
        const payload = JwtUtil.verifyToken<{ userId: string; type: string }>(token);

        // Check if it's an access token
        if (payload.type !== 'access') {
            return reply.status(401).send({
                success: false,
                message: 'Invalid token type'
            });
        }

        // Get user from database
        const user = await prisma.users.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                role: true,
                full_name: true
            }
        });

        if (!user) {
            return reply.status(401).send({
                success: false,
                message: 'User not found'
            });
        }

        // Attach user to request
        request.user = user;

    } catch (error) {
        if (error instanceof Error) {
            return reply.status(401).send({
                success: false,
                message: error.message
            });
        }

        return reply.status(401).send({
            success: false,
            message: 'Authentication failed'
        });
    }
}

/**
 * Optional authentication middleware
 * Doesn't fail if no token is provided, but verifies if present
 */
export async function optionalAuthMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        let token: string | null = null;

        // Try to get token from Authorization header first
        token = JwtUtil.extractTokenFromHeader(request.headers.authorization);

        // If not in header, try cookies
        if (!token && request.cookies.jwt) {
            token = request.cookies.jwt;
        }

        // If no token, just continue without user
        if (!token) {
            return;
        }

        // Verify token using JwtUtil
        const payload = JwtUtil.verifyToken<{ userId: string; type: string }>(token);

        // Get user from database
        const user = await prisma.users.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                role: true,
                full_name: true
            }
        });

        if (user) {
            request.user = user;
        }

    } catch (error) {
        // Silently fail for optional auth
        return;
    }
}

/**
 * Role-based authorization middleware factory
 * Use after authMiddleware to check user roles
 */
export function requireRole(...allowedRoles: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(request.user.role)) {
            return reply.status(403).send({
                success: false,
                message: 'Insufficient permissions'
            });
        }
    };
}
