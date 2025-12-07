/**
 * Base Application Error
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(
        message: string,
        statusCode: number,
        errorCode: string,
        isOperational = true,
        details?: any
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        this.details = details;

        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

/* ------------------------- 400 - Bad Request ------------------------- */
export class BadRequestError extends AppError {
    constructor(message: string, errorCode = 'BAD_REQUEST') {
        super(message, 400, errorCode);
    }
}

/* ------------------------- 401 - Unauthorized ------------------------ */
export class UnauthorizedError extends AppError {
    constructor(message: string, errorCode = 'UNAUTHORIZED') {
        super(message, 401, errorCode);
    }
}

/* --------------------------- 403 - Forbidden ------------------------- */
export class ForbiddenError extends AppError {
    constructor(message: string, errorCode = 'FORBIDDEN') {
        super(message, 403, errorCode);
    }
}

/* ---------------------------- 404 - Not Found ------------------------ */
export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404, 'NOT_FOUND');
    }

    static resource(resource: string, id?: string): NotFoundError {
        const msg = id
            ? `${resource} with ID '${id}' not found`
            : `${resource} not found`;
        return new NotFoundError(msg);
    }
}

/* --------------------------- 409 - Conflict -------------------------- */
export class ConflictError extends AppError {
    constructor(message: string, errorCode = 'CONFLICT') {
        super(message, 409, errorCode);
    }
}

/* --------------------- 422 - Validation Errors ----------------------- */
export class ValidationError extends AppError {
    constructor(message: string, errorCode = 'VALIDATION_ERROR') {
        super(message, 422, errorCode);
    }
}

/* ----------------------- 500 - Internal Error ------------------------ */
export class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, 'INTERNAL_SERVER_ERROR', false);
    }
}

/* ===================================================================== */
/*                      DOMAIN-SPECIFIC BUSINESS ERRORS                  */
/* ===================================================================== */

/* ---------------- Authentication & Authorization -------------------- */
export class InvalidCredentialsError extends UnauthorizedError {
    constructor() {
        super('Invalid credentials', 'INVALID_CREDENTIALS');
    }
}

export class IncorrectPasswordError extends BadRequestError {
    constructor() {
        super('Current password is incorrect', 'INCORRECT_PASSWORD');
    }
}

export class InsufficientPermissionsError extends ForbiddenError {
    constructor() {
        super('You do not have permission to perform this action', 'INSUFFICIENT_PERMISSIONS');
    }
}

export class AccountInactiveError extends ForbiddenError {
    constructor() {
        super('User account is inactive', 'ACCOUNT_INACTIVE');
    }
}

/* ------------------------ Password-specific -------------------------- */
export class PasswordTooShortError extends BadRequestError {
    constructor(min = 6) {
        super(`Password must be at least ${min} characters long`, 'PASSWORD_TOO_SHORT');
    }
}

export class PasswordSameAsOldError extends BadRequestError {
    constructor() {
        super('New password must be different from current password', 'PASSWORD_SAME_AS_OLD');
    }
}

/* ----------------------- Self-modification --------------------------- */
export class SelfModificationError extends BadRequestError {
    constructor(message = 'You cannot modify your own account') {
        super(message, 'SELF_MODIFICATION_NOT_ALLOWED');
    }
}

/* ===================================================================== */
/*                           UTILITY FUNCTIONS                           */
/* ===================================================================== */

/**
 * Check if error is a trusted operational error (AppError)
 */
export const isTrustedError = (error: Error): boolean => {
    return error instanceof AppError && error.isOperational;
};
