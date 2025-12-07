import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from './user.service';

import {
    UpdateProfileDto,
    ChangePasswordDto,
    GetAllUsersQueryDto,
    UpdateUserRoleDto,
} from './user.dto';

import {
    SelfModificationError,
    InsufficientPermissionsError,
    NotFoundError,
    AppError,
} from '../../utils/error';

import {
    sendSuccess,
    sendSuccessWithPagination,
    sendError,
} from '../../utils/response';

import { createLogger } from '../../utils/logger';
const logger = createLogger('UserController');

export class UserController {

    // ============================
    // USER METHODS
    // ============================

    getProfile = async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = req.user!.id;
            const user = await UserService.getProfile(userId);

            if (!user) {
                logger.warn('getProfile', `Not found: ${userId}`);
                return sendError(reply, NotFoundError.resource('User', userId));
            }

            logger.info('getProfile', `Fetched: ${userId}`);
            return sendSuccess(reply, user);
        } catch (e) {
            logger.error('getProfile', 'Failed to get profile', e);
            return sendError(reply, e as Error);
        }
    };

    updateProfile = async (
        req: FastifyRequest<{ Body: UpdateProfileDto }>,
        reply: FastifyReply
    ) => {
        try {
            const userId = req.user!.id;
            const dto = req.body;

            // DTO clean-up
            if (dto.full_name) dto.full_name = dto.full_name.trim();
            if (dto.gender) dto.gender = dto.gender.toLowerCase();

            const updated = await UserService.updateProfile(userId, dto);

            if (!updated) {
                logger.warn('updateProfile', `Not found: ${userId}`);
                return sendError(reply, NotFoundError.resource('User', userId));
            }

            logger.success('updateProfile', `Updated: ${userId}`);
            return sendSuccess(reply, updated);
        } catch (e) {
            logger.error('updateProfile', 'Failed to update profile', e);
            return sendError(reply, e as AppError);
        }
    };

    changePassword = async (
        req: FastifyRequest<{ Body: ChangePasswordDto }>,
        reply: FastifyReply
    ) => {
        try {
            const userId = req.user!.id;
            const { oldPassword, newPassword } = req.body;

            await UserService.changePassword(userId, oldPassword, newPassword);

            logger.success('changePassword', `Changed: ${userId}`);
            return sendSuccess(reply, null);
        } catch (e) {
            logger.error('changePassword', 'Failed to change password', e);
            return sendError(reply, e as Error);
        }
    };

    deactivateAccount = async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = req.user!.id;

            await UserService.deactivateAccount(userId);

            logger.success('deactivateAccount', `Deactivated: ${userId}`);
            return sendSuccess(reply, null);
        } catch (e) {
            logger.error('deactivateAccount', 'Failed to deactivate account', e);
            return sendError(reply, e as Error);
        }
    };

    getUserById = async (
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const targetId = req.params.id;
            const current = req.user!;

            if (current.id !== targetId && current.role !== 'admin') {
                logger.warn('getUserById', `Blocked: ${current.id}`);
                return sendError(reply, new InsufficientPermissionsError());
            }

            const user = await UserService.getUserById(targetId);

            if (!user) {
                logger.warn('getUserById', `Not found: ${targetId}`);
                return sendError(reply, NotFoundError.resource('User', targetId));
            }

            logger.info('getUserById', `Fetched: ${targetId}`);
            return sendSuccess(reply, user);
        } catch (e) {
            logger.error('getUserById', 'Failed to get user by ID', e);
            return sendError(reply, e as Error);
        }
    };

    // ============================
    // ADMIN METHODS
    // ============================

    getAllUsers = async (
        req: FastifyRequest<{ Querystring: GetAllUsersQueryDto }>,
        reply: FastifyReply
    ) => {
        try {
            const filters: {
                search?: string;
                role?: string;
                gender?: string;
                is_verified?: boolean;
                is_active?: boolean;
                sortBy?: string;
                sortOrder?: 'asc' | 'desc';
                page?: number;
                limit?: number;
            } = {};

            // Only add properties if they have defined values
            if (req.query.search) filters.search = req.query.search;
            if (req.query.role) filters.role = req.query.role;
            if (req.query.gender) filters.gender = req.query.gender;
            if (req.query.is_verified !== undefined) filters.is_verified = req.query.is_verified === 'true';
            if (req.query.is_active !== undefined) filters.is_active = req.query.is_active === 'true';
            if (req.query.sortBy) filters.sortBy = req.query.sortBy;
            if (req.query.sortOrder) filters.sortOrder = req.query.sortOrder as 'asc' | 'desc';
            if (req.query.page) filters.page = Number(req.query.page);
            if (req.query.limit) filters.limit = Number(req.query.limit);

            const result = await UserService.getAllUsers(filters);

            logger.info(
                'getAllUsers',
                `Count: ${result.users.length} Page: ${result.pagination.page}`
            );

            return sendSuccessWithPagination(reply, result.users, result.pagination);
        } catch (e) {
            logger.error('getAllUsers', 'Failed to get all users', e);
            return sendError(reply, e as Error);
        }
    };

    updateUserRole = async (
        req: FastifyRequest<{ Params: { id: string }; Body: UpdateUserRoleDto }>,
        reply: FastifyReply
    ) => {
        try {
            const adminId = req.user!.id;

            if (adminId === req.params.id) {
                logger.warn('updateUserRole', `Self-modification blocked: ${adminId}`);
                return sendError(reply, new SelfModificationError('You cannot change your own role'));
            }

            const updated = await UserService.updateUserRole(req.params.id, req.body.role);

            logger.success('updateUserRole', `Updated: ${req.params.id}`);
            return sendSuccess(reply, updated);
        } catch (e) {
            logger.error('updateUserRole', 'Failed to update user role', e);
            return sendError(reply, e as Error);
        }
    };

    deleteUser = async (
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            if (req.user!.id === req.params.id) {
                logger.warn('deleteUser', `Self-deletion blocked: ${req.user!.id}`);
                return sendError(reply, new SelfModificationError('You cannot delete your own account'));
            }

            await UserService.deleteUser(req.params.id);

            logger.success('deleteUser', `Deleted: ${req.params.id}`);
            return sendSuccess(reply, null);
        } catch (e) {
            logger.error('deleteUser', 'Failed to delete user', e);
            return sendError(reply, e as Error);
        }
    };

    toggleUserStatus = async (
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            if (req.user!.id === req.params.id) {
                logger.warn('toggleUserStatus', `Self-toggle blocked: ${req.user!.id}`);
                return sendError(reply, new SelfModificationError('You cannot toggle your own status'));
            }

            const updated = await UserService.toggleUserStatus(req.params.id);

            logger.success('toggleUserStatus', `Toggled: ${req.params.id}`);
            return sendSuccess(reply, updated);
        } catch (e) {
            logger.error('toggleUserStatus', 'Failed to toggle user status', e);
            return sendError(reply, e as Error);
        }
    };

    toggleUserVerified = async (
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const updated = await UserService.toggleUserVerified(req.params.id);

            logger.success('toggleUserVerified', `Toggled verified: ${req.params.id}`);
            return sendSuccess(reply, updated);
        } catch (e) {
            logger.error('toggleUserVerified', 'Failed to toggle user verified status', e);
            return sendError(reply, e as Error);
        }
    };
}
