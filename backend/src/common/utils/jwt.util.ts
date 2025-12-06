import jwt from 'jsonwebtoken';

/**
 * JWT Utility for token generation and verification
 * Centralizes all JWT-related operations for reusability
 */
export class JwtUtil {
    private static readonly JWT_SECRET: string = process.env.JWT_SECRET || 'secret321';
    private static readonly JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
    private static readonly REFRESH_TOKEN_EXPIRES_IN: string = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

    /**
     * Generate access token for user authentication
     * @param userId - User ID to encode in token
     * @param additionalPayload - Optional additional data to include in token
     * @returns JWT access token string
     */
    static generateAccessToken(userId: string, additionalPayload?: Record<string, any>): string {
        const payload = {
            userId,
            ...additionalPayload,
            type: 'access'
        };

        return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions);
    }

    /**
     * Generate refresh token for token renewal
     * @param userId - User ID to encode in token
     * @returns JWT refresh token string
     */
    static generateRefreshToken(userId: string): string {
        const payload = {
            userId,
            type: 'refresh'
        };

        return jwt.sign(
            payload,
            this.JWT_SECRET,
            { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
        );
    }

    /**
     * Generate both access and refresh tokens
     * @param userId - User ID to encode in tokens
     * @param additionalPayload - Optional additional data for access token
     * @returns Object containing both access and refresh tokens
     */
    static generateTokenPair(userId: string, additionalPayload?: Record<string, any>) {
        return {
            accessToken: this.generateAccessToken(userId, additionalPayload),
            refreshToken: this.generateRefreshToken(userId)
        };
    }

    /**
     * Verify and decode JWT token
     * @param token - JWT token to verify
     * @returns Decoded token payload
     * @throws Error if token is invalid or expired
     */
    static verifyToken<T = { userId: string; type: string }>(token: string): T {
        try {
            return jwt.verify(token, this.JWT_SECRET) as T;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token has expired');
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw new Error('Token verification failed');
        }
    }

    /**
     * Decode token without verification (useful for debugging)
     * @param token - JWT token to decode
     * @returns Decoded token payload or null if invalid
     */
    static decodeToken(token: string): any {
        return jwt.decode(token);
    }

    /**
     * Check if token is expired without throwing error
     * @param token - JWT token to check
     * @returns true if expired, false otherwise
     */
    static isTokenExpired(token: string): boolean {
        try {
            this.verifyToken(token);
            return false;
        } catch (error) {
            if (error instanceof Error && error.message === 'Token has expired') {
                return true;
            }
            return false;
        }
    }

    /**
     * Extract token from Authorization header
     * @param authHeader - Authorization header value (e.g., "Bearer token123")
     * @returns Extracted token or null
     */
    static extractTokenFromHeader(authHeader?: string): string | null {
        if (!authHeader) return null;

        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            return parts[1] || null;
        }

        return null;
    }

    /**
     * Get token expiration time in seconds
     * @param token - JWT token
     * @returns Expiration timestamp or null
     */
    static getTokenExpiration(token: string): number | null {
        const decoded = this.decodeToken(token);
        return decoded?.exp || null;
    }

    /**
     * Get remaining time until token expires (in seconds)
     * @param token - JWT token
     * @returns Remaining seconds or null if invalid
     */
    static getTokenRemainingTime(token: string): number | null {
        const exp = this.getTokenExpiration(token);
        if (!exp) return null;

        const now = Math.floor(Date.now() / 1000);
        return Math.max(0, exp - now);
    }
}
