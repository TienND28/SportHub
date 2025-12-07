import { FastifyInstance } from 'fastify';
import { UserController } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/role.middleware';
import { validateBody } from '../../middlewares/validation.middleware';
import {
    UpdateProfileDto,
    ChangePasswordDto,
    UpdateUserRoleDto,
    GetAllUsersQueryDto
} from './user.dto';

/**
 * User Router - defines all user-related routes
 * @param app - Fastify instance
 */
export async function userRouter(app: FastifyInstance) {
    const userController = new UserController();

    // ============ USER ROUTES ============

    /**
     * GET /profile - Get current user's profile
     */
    app.get(
        '/profile',
        { preHandler: [authMiddleware] },
        userController.getProfile
    );

    /**
     * PUT /profile - Update current user's profile
     */
    app.put<{ Body: UpdateProfileDto }>(
        '/profile',
        { preHandler: [authMiddleware, validateBody(UpdateProfileDto)] },
        userController.updateProfile
    );

    /**
     * PUT /password - Change current user's password
     */
    app.put<{ Body: ChangePasswordDto }>(
        '/password',
        { preHandler: [authMiddleware, validateBody(ChangePasswordDto)] },
        userController.changePassword
    );

    /**
     * DELETE /account - Deactivate current user's account
     */
    app.delete(
        '/account',
        { preHandler: [authMiddleware] },
        userController.deactivateAccount
    );

    /**
     * GET /:id - Get user by ID (requires auth, users can only view own profile or admin can view any)
     */
    app.get<{ Params: { id: string } }>(
        '/:id',
        { preHandler: [authMiddleware] },
        userController.getUserById
    );

    // ============ ADMIN ROUTES ============

    /**
     * GET /admin/all - Get all users with filtering, sorting, and pagination
     */
    app.get<{ Querystring: GetAllUsersQueryDto }>(
        '/admin/all',
        { preHandler: [authMiddleware] },
        userController.getAllUsers
    );

    /**
     * PUT /admin/:id/role - Update user role
     */
    app.put<{ Params: { id: string }; Body: UpdateUserRoleDto }>(
        '/admin/:id/role',
        { preHandler: [authMiddleware, validateBody(UpdateUserRoleDto)] },
        userController.updateUserRole
    );

    /**
     * DELETE /admin/:id - Delete user permanently
     */
    app.delete<{ Params: { id: string } }>(
        '/admin/:id',
        { preHandler: [authMiddleware, requireAdmin] },
        userController.deleteUser
    );

    /**
     * PATCH /admin/:id/toggle-status - Toggle user active status
     */
    app.patch<{ Params: { id: string } }>(
        '/admin/:id/toggle-status',
        { preHandler: [authMiddleware, requireAdmin] },
        userController.toggleUserStatus
    );

    /**
     * PATCH /admin/:id/toggle-verified - Toggle user verified status
     */
    app.patch<{ Params: { id: string } }>(
        '/admin/:id/toggle-verified',
        { preHandler: [authMiddleware, requireAdmin] },
        userController.toggleUserVerified
    );
}
