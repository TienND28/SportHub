import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'secret321';
const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || '7d';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '30d';

export function generateAccessToken(
    userId: string,
    additionalPayload?: Record<string, any>
): string {
    return jwt.sign(
        { userId, ...additionalPayload, type: 'access' },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN } as jwt.SignOptions & { expiresIn: string }
    );
}

export function generateRefreshToken(userId: string): string {
    return jwt.sign(
        { userId, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN } as jwt.SignOptions & { expiresIn: string }
    );
}

export function generateTokenPair(
    userId: string,
    additionalPayload?: Record<string, any>
) {
    return {
        accessToken: generateAccessToken(userId, additionalPayload),
        refreshToken: generateRefreshToken(userId)
    };
}

export function verifyToken<T = { userId: string; type: string }>(token: string): T {
    try {
        return jwt.verify(token, JWT_SECRET) as T;
    } catch (error: any) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error("Token has expired");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error("Invalid token");
        }
        throw new Error("Token verification failed");
    }
}

export function decodeToken(token: string) {
    return jwt.decode(token);
}

export function extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;

    const [type, token] = authHeader.split(" ");
    return type === "Bearer" && token ? token : null;
}

export function getTokenExpiration(token: string): number | null {
    const decoded = jwt.decode(token);

    if (!decoded || typeof decoded === "string") return null;

    return decoded.exp ?? null;
}


export function getTokenRemainingTime(token: string): number | null {
    const exp = getTokenExpiration(token);
    if (!exp) return null;

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, exp - now);
}
