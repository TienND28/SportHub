import { FastifyReply } from 'fastify';
import { AppError, isTrustedError } from './error';

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    timestamp: string;
}

/**
 * Send success response
 */
export const sendSuccess = <T = any>(
    reply: FastifyReply,
    data: T,
    message = 'Success',
    statusCode = 200
): void => {
    reply.status(statusCode).send({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    } as ApiResponse<T>);
};

/**
 * Send success response with pagination
 */
export const sendSuccessWithPagination = <T = any>(
    reply: FastifyReply,
    data: T,
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    },
    message = 'Success',
    statusCode = 200
): void => {
    reply.status(statusCode).send({
        success: true,
        message,
        data,
        pagination,
        timestamp: new Date().toISOString(),
    } as ApiResponse<T>);
};

/**
 * Send created response (201)
 */
export const sendCreated = <T = any>(
    reply: FastifyReply,
    data: T,
    message = 'Created'
): void => {
    sendSuccess(reply, data, message, 201);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (reply: FastifyReply): void => {
    reply.status(204).send();
};

/**
 * Send accepted response (202)
 */
export const sendAccepted = <T = any>(
    reply: FastifyReply,
    data: T,
    message = 'Accepted'
): void => {
    sendSuccess(reply, data, message, 202);
};

/**
 * Send error response (AppError + unexpected errors)
 */
export const sendError = (
    reply: FastifyReply,
    error: Error | AppError,
    defaultMessage = 'An unexpected error occurred'
): void => {

    // Trusted application error
    if (isTrustedError(error)) {
        const appErr = error as AppError;

        reply.status(appErr.statusCode).send({
            success: false,
            message: appErr.message,
            error: {
                code: appErr.errorCode,
                message: appErr.message,
                ...(appErr.details && { details: appErr.details }),
            },
            timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
    }

    // Unknown / untrusted error → Always 500
    console.error('UNEXPECTED ERROR:', error);

    reply.status(500).send({
        success: false,
        message: defaultMessage,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message:
                process.env.NODE_ENV === 'production'
                    ? defaultMessage
                    : error.message || defaultMessage,
        },
        timestamp: new Date().toISOString(),
    } as ApiResponse);
};

/**
 * Async wrapper for controller functions
 */
export const asyncHandler = (
    fn: (req: any, reply: FastifyReply) => Promise<any>
) => {
    return async (req: any, reply: FastifyReply) => {
        try {
            await fn(req, reply);
        } catch (error) {
            sendError(reply, error as any);
        }
    };
};
