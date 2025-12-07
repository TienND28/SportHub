import { FastifyRequest, FastifyReply } from 'fastify';
import { extractTokenFromHeader, verifyToken } from '../common/utils';
import prisma from '../config/database';

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string;
            email: string;
            role: string;
        };
    }
}

export async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        let token: string | null = null;

        token = extractTokenFromHeader(request.headers.authorization);

        if (!token && request.cookies.jwt) {
            token = request.cookies.jwt;
        }

        if (!token) {
            return reply.status(401).send({
                success: false,
                message: 'No authentication token provided'
            });
        }

        const payload = verifyToken<{ userId: string; type: string }>(token);

        if (payload.type !== 'access') {
            return reply.status(401).send({
                success: false,
                message: 'Invalid token type'
            });
        }

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

export async function optionalAuthMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        let token: string | null = null;

        token = extractTokenFromHeader(request.headers.authorization);

        if (!token && request.cookies.jwt) {
            token = request.cookies.jwt;
        }

        // If no token, just continue without user
        if (!token) {
            return;
        }

        // Verify token using JwtUtil
        const payload = verifyToken<{ userId: string; type: string }>(token);

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
