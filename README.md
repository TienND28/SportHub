# SportHub - Event Management Platform

A comprehensive event management platform for sports events, built with modern web technologies.

## 🏗️ Project Structure

```
SportHub/
├── backend/          # Node.js + Fastify + Prisma backend
│   ├── src/
│   │   ├── common/   # Shared utilities (JWT, etc.)
│   │   ├── config/   # Configuration files
│   │   ├── middlewares/
│   │   ├── modules/  # Feature modules (auth, events, etc.)
│   │   └── ...
│   └── prisma/       # Database schema and migrations
│
└── frontend/         # React + Vite + TailwindCSS frontend
    └── src/
        ├── components/
        ├── pages/
        └── ...
```

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Fastify
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT (custom utility)
- **Language**: TypeScript

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Language**: TypeScript

## 📦 Installation

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your DATABASE_URL in .env
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_secret_key
ACCESS_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=30d
NODE_ENV=development
```

## 📚 Documentation

- [JWT Architecture](./backend/docs/JWT_ARCHITECTURE.md)
- [JWT Utility Guide](./backend/src/common/utils/JWT_UTIL_README.md)

## 🌟 Features

### Authentication System
- ✅ JWT-based authentication
- ✅ Access & Refresh token management
- ✅ Token rotation on refresh
- ✅ Secure httpOnly cookies
- ✅ Role-based authorization
- ✅ Centralized JWT utility

### Frontend
- ✅ Responsive homepage
- ✅ Authentication modal (Login/Register)
- ✅ Remember me functionality
- ✅ Clean, modern UI

## 🔧 Development

### Backend
```bash
npm run dev    # Start development server
npm run build  # Build for production
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📝 License

MIT

## 👥 Contributors

SportHub Development Team

---

**Last Updated**: 2025-12-06
