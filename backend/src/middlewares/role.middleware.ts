import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    if (!request.user) {
        return reply.status(401).send({
            success: false,
            message: 'Authentication required',
        });
    }

    if (request.user.role !== 'admin') {
        return reply.status(403).send({
            success: false,
            message: 'Admin access required',
        });
    }
};

/**
 * Middleware to check if user has one of the allowed roles
 */
export const requireRoles = (allowedRoles: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!allowedRoles.includes(request.user.role)) {
            return reply.status(403).send({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
            });
        }
    };
};
