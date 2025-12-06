import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';

const REFRESH_COOKIE_NAME = 'refresh_jwt';
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    // maxAge in seconds (example 30 days)
    maxAge: 30 * 24 * 60 * 60
};

export class AuthController {
    register = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as RegisterDto;
            const { user, accessToken, refreshToken } = await AuthService.register(body);

            // set refresh token cookie
            reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

            return reply.status(201).send({
                success: true,
                message: 'User registered successfully',
                data: { user, accessToken }
            });
        } catch (error: any) {
            return reply.status(400).send({ success: false, message: error.message || 'Registration failed' });
        }
    };

    login = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as LoginDto;
            const { user, accessToken, refreshToken } = await AuthService.login(body);

            // Set refresh cookie only
            reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

            return reply.status(200).send({
                success: true,
                message: 'Login successful',
                data: { user, accessToken }
            });
        } catch (error: any) {
            return reply.status(401).send({ success: false, message: error.message || 'Login failed' });
        }
    };

    refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const token = request.cookies[REFRESH_COOKIE_NAME];
            if (!token) return reply.status(401).send({ success: false, message: 'No token provided' });

            const { accessToken, refreshToken, user } = await AuthService.refreshToken(token);

            // rotate refresh cookie
            reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

            return reply.status(200).send({ success: true, message: 'Token refreshed', data: { user, accessToken } });
        } catch (error: any) {
            return reply.status(401).send({ success: false, message: error.message || 'Token refresh failed' });
        }
    };

    logout = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const token = request.cookies[REFRESH_COOKIE_NAME];
            if (token) {
                // decode to get userId (or get from request.user if already set by auth middleware)
                try {
                    const decoded = (await import('jsonwebtoken')).verify(token, process.env.JWT_SECRET || 'secret321') as { userId: string };
                    if (decoded?.userId) await AuthService.logout(decoded.userId);
                } catch { /* ignore */ }
            }

            reply.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
            return reply.status(200).send({ success: true, message: 'Logout successful' });
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message || 'Logout failed' });
        }
    };
}
