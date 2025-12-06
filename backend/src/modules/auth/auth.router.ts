import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';

export async function authRouter(app: FastifyInstance) {
    const authController = new AuthController();

    // Register route
    app.post('/register', authController.register);

    // Login route
    app.post('/login', authController.login);

    // Logout route
    app.post('/logout', authController.logout);

    // Refresh token route
    app.post('/refresh', authController.refreshToken);
}