# SportHub Backend - Hướng dẫn kết nối Database

## 📦 Cài đặt

Các package đã được cài đặt:
- `@prisma/client` - Prisma Client để tương tác với database
- `prisma` - Prisma CLI tools
- `dotenv` - Load environment variables

## 🔧 Cấu hình Database

### 1. Tạo file `.env`

Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Database Configuration (Neon PostgreSQL)
DATABASE_URL='postgresql://neondb_owner:npg_NPOoV8nmzE1e@ep-damp-cell-a1ir5m8p-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 2. Cấu trúc Prisma

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── prisma.config.ts     # Prisma 7 configuration
│   └── migrations/          # Database migrations (sẽ tạo sau)
├── src/
│   ├── config/
│   │   └── database.ts      # Prisma Client instance
│   └── generated/
│       └── prisma/          # Generated Prisma Client
└── server.ts
```

## 🚀 Các lệnh Prisma

### Generate Prisma Client
```bash
npx prisma generate
```

### Tạo migration mới
```bash
npx prisma migrate dev --name init
```

### Apply migrations
```bash
npx prisma migrate deploy
```

### Mở Prisma Studio (GUI để xem data)
```bash
npx prisma studio
```

### Reset database
```bash
npx prisma migrate reset
```

### Format schema file
```bash
npx prisma format
```

## 📝 Sử dụng Prisma trong code

### Import Prisma Client
```typescript
import prisma from './src/config/database';
```

### Ví dụ CRUD operations

#### Create
```typescript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: 'hashed_password',
    role: 'USER',
  },
});
```

#### Read
```typescript
// Find one
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
});

// Find many
const users = await prisma.user.findMany({
  where: { role: 'USER' },
  orderBy: { createdAt: 'desc' },
});
```

#### Update
```typescript
const user = await prisma.user.update({
  where: { id: 'user-id' },
  data: { name: 'Jane Doe' },
});
```

#### Delete
```typescript
await prisma.user.delete({
  where: { id: 'user-id' },
});
```

## 🏃 Chạy server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔍 Health Checks

Server cung cấp các endpoints để kiểm tra:

- `GET /` - API status
- `GET /health` - Server health
- `GET /health/db` - Database connection status

## 📚 Tài liệu tham khảo

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Neon PostgreSQL](https://neon.tech/docs)
