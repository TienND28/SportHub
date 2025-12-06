# Kiến Trúc JWT Token trong SportHub Backend

## 📋 Tổng quan

Dự án đã được tổ chức lại để tách biệt logic JWT token vào một utility class riêng biệt, giúp code dễ bảo trì và tái sử dụng hơn.

## 🏗️ Cấu trúc

```
backend/src/
├── common/
│   └── utils/
│       ├── jwt.util.ts          # ⭐ JWT Utility Class
│       ├── index.ts              # Export utilities
│       └── JWT_UTIL_README.md    # Tài liệu sử dụng
├── middlewares/
│   └── auth.middleware.ts        # ⭐ Authentication Middleware (sử dụng JwtUtil)
└── modules/
    └── auth/
        ├── auth.service.ts       # ⭐ Auth Service (sử dụng JwtUtil)
        ├── auth.controller.ts    # Auth Controller
        └── auth.dto.ts           # DTOs
```

## 🎯 Các thành phần chính

### 1. **JwtUtil** (`src/common/utils/jwt.util.ts`)

**Trách nhiệm**: Quản lý tất cả các thao tác liên quan đến JWT token

**Các phương thức**:
- `generateAccessToken()` - Tạo access token
- `generateRefreshToken()` - Tạo refresh token
- `generateTokenPair()` - Tạo cả 2 tokens cùng lúc
- `verifyToken()` - Xác thực token
- `decodeToken()` - Giải mã token (không xác thực)
- `isTokenExpired()` - Kiểm tra token hết hạn
- `extractTokenFromHeader()` - Trích xuất token từ header
- `getTokenExpiration()` - Lấy thời gian hết hạn
- `getTokenRemainingTime()` - Lấy thời gian còn lại

**Lợi ích**:
- ✅ Tập trung hóa logic JWT
- ✅ Dễ dàng test
- ✅ Type-safe với TypeScript generics
- ✅ Xử lý lỗi rõ ràng

### 2. **AuthService** (`src/modules/auth/auth.service.ts`)

**Trách nhiệm**: Xử lý business logic authentication

**Sử dụng JwtUtil**:
```typescript
// Tạo tokens khi đăng ký/đăng nhập
const accessToken = JwtUtil.generateAccessToken(user.id);
const refreshToken = JwtUtil.generateRefreshToken(user.id);

// Xác thực token khi refresh
const decoded = JwtUtil.verifyToken<{ userId: string }>(token);
```

**Lợi ích**:
- ✅ Service tập trung vào business logic
- ✅ Không lo về chi tiết kỹ thuật JWT
- ✅ Code ngắn gọn, dễ đọc

### 3. **AuthMiddleware** (`src/middlewares/auth.middleware.ts`)

**Trách nhiệm**: Xác thực request và gắn user vào request

**Sử dụng JwtUtil**:
```typescript
// Trích xuất token từ header
const token = JwtUtil.extractTokenFromHeader(request.headers.authorization);

// Xác thực token
const payload = JwtUtil.verifyToken<{ userId: string }>(token);
```

**Các middleware**:
- `authMiddleware` - Bắt buộc phải có token
- `optionalAuthMiddleware` - Token không bắt buộc
- `requireRole()` - Kiểm tra role của user

## 🔄 Flow hoạt động

### 1. **Đăng ký / Đăng nhập**
```
User Request
    ↓
AuthController
    ↓
AuthService.register/login()
    ↓
JwtUtil.generateAccessToken()  ← Tạo access token
JwtUtil.generateRefreshToken() ← Tạo refresh token
    ↓
Lưu refresh token vào DB (hashed)
    ↓
Trả về tokens cho client
```

### 2. **Xác thực Request**
```
Protected Route Request
    ↓
authMiddleware
    ↓
JwtUtil.extractTokenFromHeader()  ← Lấy token từ header
    ↓
JwtUtil.verifyToken()             ← Xác thực token
    ↓
Lấy user từ DB
    ↓
Gắn user vào request.user
    ↓
Route Handler
```

### 3. **Refresh Token**
```
Refresh Request
    ↓
AuthController.refreshToken()
    ↓
AuthService.refreshToken()
    ↓
JwtUtil.verifyToken()             ← Xác thực refresh token
    ↓
Kiểm tra token trong DB
    ↓
JwtUtil.generateAccessToken()     ← Tạo access token mới
JwtUtil.generateRefreshToken()    ← Tạo refresh token mới
    ↓
Xóa refresh token cũ, lưu token mới
    ↓
Trả về tokens mới
```

## 📝 Ví dụ sử dụng

### Trong Service
```typescript
import { JwtUtil } from '../../common/utils';

const accessToken = JwtUtil.generateAccessToken(userId);
const refreshToken = JwtUtil.generateRefreshToken(userId);
```

### Trong Middleware
```typescript
import { JwtUtil } from '../common/utils';

const token = JwtUtil.extractTokenFromHeader(request.headers.authorization);
const payload = JwtUtil.verifyToken<{ userId: string }>(token);
```

### Trong Route
```typescript
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

// Route cần authentication
fastify.get('/profile', {
    preHandler: [authMiddleware]
}, async (request, reply) => {
    return { user: request.user };
});

// Route cần role admin
fastify.delete('/users/:id', {
    preHandler: [authMiddleware, requireRole('admin')]
}, async (request, reply) => {
    // Only admin can access
});
```

## ⚙️ Cấu hình

Thêm vào `.env`:
```env
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
```

## 🎨 Best Practices

### ✅ NÊN:
1. Sử dụng `JwtUtil` cho tất cả thao tác JWT
2. Lưu refresh token vào database (đã hash)
3. Sử dụng access token có thời gian ngắn (15m)
4. Sử dụng refresh token có thời gian dài (30d)
5. Xác thực token trong middleware
6. Kiểm tra role/permissions sau khi xác thực

### ❌ KHÔNG NÊN:
1. Tạo token trực tiếp bằng `jwt.sign()` trong service/controller
2. Lưu access token vào database
3. Sử dụng access token có thời gian quá dài
4. Bỏ qua việc xác thực token
5. Hardcode secret key trong code

## 🔒 Bảo mật

1. **Secret Key**: Sử dụng secret key mạnh và lưu trong biến môi trường
2. **Token Expiration**: Access token ngắn, refresh token dài
3. **Token Storage**: 
   - Access token: Lưu ở client (memory/localStorage)
   - Refresh token: Lưu trong httpOnly cookie
4. **Token Rotation**: Refresh token mới mỗi lần refresh
5. **Token Revocation**: Xóa refresh token khỏi DB khi logout

## 📚 Tài liệu tham khảo

- [JWT_UTIL_README.md](./JWT_UTIL_README.md) - Hướng dẫn chi tiết về JwtUtil
- [JWT.io](https://jwt.io/) - JWT documentation
- [Fastify Authentication](https://www.fastify.io/docs/latest/Guides/Getting-Started/#your-first-plugin) - Fastify docs

## 🚀 Mở rộng trong tương lai

1. **Token Blacklist**: Thêm blacklist cho access token bị revoke
2. **Multiple Devices**: Quản lý nhiều refresh token cho nhiều thiết bị
3. **Token Refresh Strategy**: Tự động refresh token trước khi hết hạn
4. **Audit Log**: Log tất cả các thao tác liên quan đến token
5. **Rate Limiting**: Giới hạn số lần refresh token

---

**Tác giả**: SportHub Development Team  
**Ngày cập nhật**: 2025-12-06
