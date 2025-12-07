import { FastifyRequest, FastifyReply } from 'fastify';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

function formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    const traverse = (errs: ValidationError[], parentPath = '') => {
        for (const err of errs) {
            const path = parentPath ? `${parentPath}.${err.property}` : err.property;
            if (err.constraints) {
                result[path] = Object.values(err.constraints);
            }
            if (err.children && err.children.length > 0) {
                traverse(err.children, path);
            }
        }
    };

    traverse(errors);
    return result;
}

export function validateBody<T extends object>(dtoClass: new () => T) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const dtoInstance = plainToClass(dtoClass, request.body);
            const errors = await validate(dtoInstance, {
                whitelist: true,
                forbidNonWhitelisted: true,
                skipMissingProperties: false,
            });

            if (errors.length > 0) {
                const errorMessages = formatValidationErrors(errors);
                const firstError = Object.values(errorMessages)[0]?.[0] || 'Validation failed';
                console.log('Validation failed:', JSON.stringify(errorMessages, null, 2));
                return reply.status(400).send({
                    success: false,
                    message: firstError,
                    errors: errorMessages, // Trả về chi tiết field
                });
            }

            request.body = dtoInstance as any;
        } catch (error: any) {
            console.error('Validation error:', error);
            return reply.status(400).send({
                success: false,
                message: error.message || 'Validation failed',
            });
        }
    };
}

export function validateQuery<T extends object>(dtoClass: new () => T) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const dtoInstance = plainToClass(dtoClass, request.query);

            const errors = await validate(dtoInstance, {
                whitelist: true,
                forbidNonWhitelisted: true,
                skipMissingProperties: false,
            });

            if (errors.length > 0) {
                const errorMessages = formatValidationErrors(errors);
                const firstError = Object.values(errorMessages)[0]?.[0] || 'Validation failed';
                console.log('Validation failed:', JSON.stringify(errorMessages, null, 2));
                return reply.status(400).send({
                    success: false,
                    message: firstError,
                    errors: errorMessages,
                });
            }

            request.query = dtoInstance as any;
        } catch (error: any) {
            console.error('Validation error:', error);
            return reply.status(400).send({
                success: false,
                message: error.message || 'Validation failed',
            });
        }
    };
}

export function validateParams<T extends object>(dtoClass: new () => T) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const dtoInstance = plainToClass(dtoClass, request.params);

            const errors = await validate(dtoInstance, {
                whitelist: true,
                forbidNonWhitelisted: true,
                skipMissingProperties: false,
            });

            if (errors.length > 0) {
                const errorMessages = formatValidationErrors(errors);
                const firstError = Object.values(errorMessages)[0]?.[0] || 'Validation failed';
                console.log('Validation failed:', JSON.stringify(errorMessages, null, 2));
                return reply.status(400).send({
                    success: false,
                    message: firstError,
                    errors: errorMessages,
                });
            }

            request.params = dtoInstance as any;
        } catch (error: any) {
            console.error('Validation error:', error);
            return reply.status(400).send({
                success: false,
                message: error.message || 'Validation failed',
            });
        }
    };
}
