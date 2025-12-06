# JWT Utility

Utility class để quản lý tất cả các thao tác liên quan đến JWT token trong ứng dụng.

## Vị trí
`src/common/utils/jwt.util.ts`

## Tính năng

### 1. **Tạo Access Token**
```typescript
import { JwtUtil } from '@/common/utils';

const accessToken = JwtUtil.generateAccessToken(userId);

// Với payload bổ sung
const accessToken = JwtUtil.generateAccessToken(userId, { 
    role: 'admin',
    permissions: ['read', 'write']
});
```

### 2. **Tạo Refresh Token**
```typescript
const refreshToken = JwtUtil.generateRefreshToken(userId);
```

### 3. **Tạo cả Access và Refresh Token cùng lúc**
```typescript
const { accessToken, refreshToken } = JwtUtil.generateTokenPair(userId);

// Với payload bổ sung cho access token
const tokens = JwtUtil.generateTokenPair(userId, { role: 'admin' });
```

### 4. **Xác thực Token**
```typescript
try {
    const payload = JwtUtil.verifyToken<{ userId: string }>(token);
    console.log(payload.userId);
} catch (error) {
    console.error('Token không hợp lệ:', error.message);
}
```

### 5. **Giải mã Token (không xác thực)**
```typescript
const decoded = JwtUtil.decodeToken(token);
console.log(decoded);
```

### 6. **Kiểm tra Token đã hết hạn chưa**
```typescript
if (JwtUtil.isTokenExpired(token)) {
    console.log('Token đã hết hạn');
}
```

### 7. **Trích xuất Token từ Authorization Header**
```typescript
const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const token = JwtUtil.extractTokenFromHeader(authHeader);
```

### 8. **Lấy thời gian hết hạn của Token**
```typescript
const exp = JwtUtil.getTokenExpiration(token);
console.log('Token sẽ hết hạn lúc:', new Date(exp * 1000));
```

### 9. **Lấy thời gian còn lại của Token**
```typescript
const remaining = JwtUtil.getTokenRemainingTime(token);
console.log(`Token còn ${remaining} giây`);
```

## Cấu hình

Các biến môi trường:
- `JWT_SECRET`: Secret key để sign token (mặc định: 'secret321')
- `JWT_EXPIRES_IN`: Thời gian hết hạn của access token (mặc định: '7d')
- `REFRESH_TOKEN_EXPIRES_IN`: Thời gian hết hạn của refresh token (mặc định: '30d')

## Ví dụ sử dụng trong Auth Service

```typescript
import { JwtUtil } from '../../common/utils';

export const AuthService = {
    async login(email: string, password: string) {
        // ... validate user ...
        
        // Tạo tokens
        const accessToken = JwtUtil.generateAccessToken(user.id);
        const refreshToken = JwtUtil.generateRefreshToken(user.id);
        
        return { user, accessToken, refreshToken };
    },
    
    async refreshToken(token: string) {
        // Xác thực refresh token
        const decoded = JwtUtil.verifyToken<{ userId: string }>(token);
        
        // Tạo token mới
        const newAccessToken = JwtUtil.generateAccessToken(decoded.userId);
        
        return { accessToken: newAccessToken };
    }
};
```

## Ví dụ sử dụng trong Middleware

```typescript
import { JwtUtil } from '../../common/utils';
import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        // Lấy token từ header
        const token = JwtUtil.extractTokenFromHeader(
            request.headers.authorization
        );
        
        if (!token) {
            return reply.status(401).send({ message: 'No token provided' });
        }
        
        // Xác thực token
        const payload = JwtUtil.verifyToken<{ userId: string }>(token);
        
        // Gắn user vào request
        request.user = { id: payload.userId };
        
    } catch (error) {
        return reply.status(401).send({ message: 'Invalid token' });
    }
}
```

## Lợi ích

✅ **Tái sử dụng code**: Tất cả logic JWT ở một nơi  
✅ **Dễ bảo trì**: Chỉ cần sửa ở một file khi cần thay đổi  
✅ **Type-safe**: Hỗ trợ TypeScript generics  
✅ **Đầy đủ tính năng**: Bao gồm tất cả các thao tác JWT phổ biến  
✅ **Error handling**: Xử lý lỗi rõ ràng và dễ hiểu  
