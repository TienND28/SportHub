import { LoginDto, RegisterDto } from './auth.dto';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../common/utils';
import prisma from '../../config/database';

const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES_IN || '30d';
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

function parseExpiryToMs(expiry: string): number {
  const regex = /^(\d+)\s*(s|m|h|d)$/i;
  const match = expiry.match(regex);

  if (!match) throw new Error(`Invalid time format: ${expiry}`);

  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase();

  switch (unit) {
    case 's': return amount * 1000;
    case 'm': return amount * 60 * 1000;
    case 'h': return amount * 60 * 60 * 1000;
    case 'd': return amount * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
}

export const AuthService = {
  // ================== REGISTER ==================
  async register(data: RegisterDto, options?: { userAgent?: string }) {
    const existingUser = await prisma.users.findUnique({
      where: { email: data.email }
    });

    if (existingUser) throw new Error('User with this email already exists');

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.users.create({
      data: {
        email: data.email,
        password: hashedPassword,
        full_name: data.name,
        phone: data.phone || null,
        role: 'customer'
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        avatar: true,
        created_at: true
      }
    });

    // Use JwtUtil to generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const hashedRefresh = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    const expiresMs = parseExpiryToMs(REFRESH_EXPIRES);

    await prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token: hashedRefresh,
        user_agent: options?.userAgent ?? null,
        expired_at: new Date(Date.now() + expiresMs)
      }
    });

    return { user, accessToken, refreshToken };
  },

  // ================== LOGIN ==================
  async login(
    data: LoginDto,
    options?: { userAgent?: string; singleDevice?: boolean }
  ) {
    const user = await prisma.users.findUnique({
      where: { email: data.email }
    });

    if (!user) throw new Error('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    // Use JwtUtil to generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const hashedRefresh = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    const expiresMs = parseExpiryToMs(REFRESH_EXPIRES);

    if (options?.singleDevice) {
      await prisma.refresh_tokens.deleteMany({ where: { user_id: user.id } });
    }

    if (options?.userAgent) {
      await prisma.refresh_tokens.deleteMany({
        where: { user_id: user.id, user_agent: options.userAgent }
      });
    }

    await prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token: hashedRefresh,
        user_agent: options?.userAgent ?? null,
        expired_at: new Date(Date.now() + expiresMs)
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      },
      accessToken,
      refreshToken
    };
  },

  // ================== REFRESH TOKEN ==================
  async refreshToken(token: string, options?: { userAgent?: string }) {
    try {
      // Use JwtUtil to verify token
      const decoded = verifyToken<{ userId: string }>(token);

      const userId = decoded.userId;
      if (!userId) throw new Error('Invalid token payload');

      const user = await prisma.users.findUnique({ where: { id: userId } });
      if (!user) throw new Error('Invalid token');

      const tokens = await prisma.refresh_tokens.findMany({
        where: { user_id: userId }
      });

      if (!tokens.length) throw new Error('Invalid or revoked refresh token');

      let matchedToken: any = null;

      for (const t of tokens) {
        if (t.expired_at.getTime() < Date.now()) continue;

        const ok = await bcrypt.compare(token, t.token);
        if (ok) {
          matchedToken = t;
          break;
        }
      }

      if (!matchedToken) throw new Error('Invalid or revoked refresh token');

      await prisma.refresh_tokens.delete({ where: { id: matchedToken.id } });

      // Use JwtUtil to generate new tokens
      const newAccess = generateAccessToken(user.id);
      const newRefresh = generateRefreshToken(user.id);

      const hashedNewRefresh = await bcrypt.hash(newRefresh, SALT_ROUNDS);
      const expiresMs = parseExpiryToMs(REFRESH_EXPIRES);

      await prisma.refresh_tokens.create({
        data: {
          user_id: user.id,
          token: hashedNewRefresh,
          user_agent: options?.userAgent ?? matchedToken.user_agent,
          expired_at: new Date(Date.now() + expiresMs)
        }
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          avatar: user.avatar
        },
        accessToken: newAccess,
        refreshToken: newRefresh
      };
    } catch {
      throw new Error('Invalid or expired token');
    }
  },

  // ================== LOGOUT ==================
  async logout(userId: string, options?: { tokenProvided?: string; userAgent?: string }) {
    if (options?.tokenProvided) {
      const tokens = await prisma.refresh_tokens.findMany({
        where: { user_id: userId }
      });

      for (const t of tokens) {
        const ok = await bcrypt.compare(options.tokenProvided, t.token);
        if (ok) {
          await prisma.refresh_tokens.delete({ where: { id: t.id } });
          return;
        }
      }

      return;
    }

    if (options?.userAgent) {
      await prisma.refresh_tokens.deleteMany({
        where: { user_id: userId, user_agent: options.userAgent }
      });
      return;
    }

    await prisma.refresh_tokens.deleteMany({ where: { user_id: userId } });
  },

  // ================== VERIFY ACCESS TOKEN ==================
  verifyAccessToken(token: string): string | null {
    try {
      // Use JwtUtil to verify token
      const payload = verifyToken<{ userId: string }>(token);
      return payload.userId ?? null;
    } catch {
      return null;
    }
  }
};
