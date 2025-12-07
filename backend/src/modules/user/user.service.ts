import bcrypt from 'bcrypt';
import prisma from '../../config/database';
import { UpdateProfileDto, UserResponse } from './user.dto';
import {
  IncorrectPasswordError,
  PasswordTooShortError,
  PasswordSameAsOldError,
  AccountInactiveError,
  NotFoundError
} from '../../utils/error';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

function toUserResponse(user: any): UserResponse {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    role: user.role,
    date_of_birth: user.date_of_birth,
    gender: user.gender,
    avatar: user.avatar,
    favorite_sports: user.favorite_sports,
    is_verified: user.is_verified ?? false,
    is_active: user.is_active ?? true,
    created_at: user.created_at ?? new Date(),
    updated_at: user.updated_at ?? new Date(),
  };
}

export const UserService = {
  /** Get user profile */
  async getProfile(userId: string): Promise<UserResponse | null> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        date_of_birth: true,
        gender: true,
        avatar: true,
        favorite_sports: true,
        is_verified: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user ? toUserResponse(user) : null;
  },

  /** Update user profile */
  async updateProfile(userId: string, data: UpdateProfileDto): Promise<UserResponse> {
    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user) throw NotFoundError.resource("User", userId);
    if (!user.is_active) throw new AccountInactiveError();

    const updateData: any = {
      ...data,
      updated_at: new Date(),
    };

    // Explicitly handle date_of_birth conversion
    if (typeof data.date_of_birth === 'string') {
      updateData.date_of_birth = data.date_of_birth === '' ? null : new Date(data.date_of_birth);
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        date_of_birth: true,
        gender: true,
        avatar: true,
        favorite_sports: true,
        is_verified: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return toUserResponse(updatedUser);
  },

  /** Change user password */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, password: true, is_active: true },
    });

    if (!user) throw NotFoundError.resource("User", userId);
    if (!user.is_active) throw new AccountInactiveError();

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) throw new IncorrectPasswordError();

    if (newPassword.length < 6) throw new PasswordTooShortError();
    if (oldPassword === newPassword) throw new PasswordSameAsOldError();

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.users.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });
  },

  /** Internal getUserById */
  async getUserById(userId: string): Promise<UserResponse | null> {
    return this.getProfile(userId);
  },

  /** Check if user exists */
  async userExists(userId: string): Promise<boolean> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return !!user;
  },

  /** Deactivate user account */
  async deactivateAccount(userId: string): Promise<void> {
    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user) throw NotFoundError.resource("User", userId);

    await prisma.users.update({
      where: { id: userId },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });

    await prisma.refresh_tokens.deleteMany({
      where: { user_id: userId },
    });
  },

  /** Reactivate user account */
  async reactivateAccount(userId: string): Promise<void> {
    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user) throw NotFoundError.resource("User", userId);

    await prisma.users.update({
      where: { id: userId },
      data: {
        is_active: true,
        updated_at: new Date(),
      },
    });
  },

  // ============ ADMIN METHODS ============

  /** Get all users (admin) */
  async getAllUsers(filters: {
    search?: string;
    role?: string;
    gender?: string;
    is_verified?: boolean;
    is_active?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      role,
      gender,
      is_verified,
      is_active,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { full_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (gender) where.gender = gender;
    if (is_verified !== undefined) where.is_verified = is_verified;
    if (is_active !== undefined) where.is_active = is_active;

    const skip = (page - 1) * limit;

    const total = await prisma.users.count({ where });

    const users = await prisma.users.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        date_of_birth: true,
        gender: true,
        avatar: true,
        favorite_sports: true,
        is_verified: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      users: users.map(toUserResponse),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /** Update user role (admin) */
  async updateUserRole(userId: string, newRole: string): Promise<UserResponse> {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw NotFoundError.resource("User", userId);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        role: newRole,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        date_of_birth: true,
        gender: true,
        avatar: true,
        favorite_sports: true,
        is_verified: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return toUserResponse(updatedUser);
  },

  /** Delete user (admin) */
  async deleteUser(userId: string): Promise<void> {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw NotFoundError.resource("User", userId);

    await prisma.$transaction([
      prisma.refresh_tokens.deleteMany({ where: { user_id: userId } }),
      prisma.users.delete({ where: { id: userId } }),
    ]);
  },

  /** Toggle user status (admin) */
  async toggleUserStatus(userId: string): Promise<UserResponse> {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw NotFoundError.resource("User", userId);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        is_active: !user.is_active,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        date_of_birth: true,
        gender: true,
        avatar: true,
        favorite_sports: true,
        is_verified: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!updatedUser.is_active) {
      await prisma.refresh_tokens.deleteMany({ where: { user_id: userId } });
    }

    return toUserResponse(updatedUser);
  },

  /** Toggle user verified status (admin) */
  async toggleUserVerified(userId: string): Promise<UserResponse> {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw NotFoundError.resource("User", userId);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        is_verified: !user.is_verified,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        date_of_birth: true,
        gender: true,
        avatar: true,
        favorite_sports: true,
        is_verified: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return toUserResponse(updatedUser);
  },
};
