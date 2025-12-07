# 🏀 SportHub Frontend Structure

> **Project**: Sports Venue Booking System

## 📁 Directory Organization

### `src/components/`
Components được chia theo mục đích sử dụng:

#### `features/` - Feature-specific components
Components dành riêng cho từng tính năng:

- **`admin/`** - Quản lý admin
  - `UserDetailModal.tsx` - Modal hiển thị chi tiết user
  
- **`booking/`** - Đặt sân *(coming soon)*
  - Components cho luồng đặt sân
  
- **`venue/`** - Quản lý sân *(coming soon)*
  - Components hiển thị thông tin sân
  
- **`payment/`** - Thanh toán *(coming soon)*
  - Components xử lý thanh toán

#### `layouts/` - Layout components
Các layout chính của ứng dụng:

- `AdminLayout.tsx` - Layout cho admin panel
- `ClientLayout.tsx` - Layout cho khách hàng *(coming soon)*
- `AuthLayout.tsx` - Layout cho trang đăng nhập/đăng ký *(coming soon)*

#### `ui/` - Reusable UI components
Components UI có thể tái sử dụng:

- `ConfirmDialog.tsx` - Dialog xác nhận
- `AuthModal.tsx` - Modal đăng nhập/đăng ký
- `Header.tsx` - Header chung
- `ProtectedRoute.tsx` - Route bảo vệ

---

### `src/pages/`
Pages được chia theo vai trò người dùng:

#### `admin/` - Admin pages
Trang quản trị:

- `DashboardPage.tsx` - Trang dashboard
- `UsersPage.tsx` - Quản lý users

#### `client/` - Client pages *(coming soon)*
Trang dành cho khách hàng:

- `BookingPage.tsx` - Trang đặt sân
- `VenuesPage.tsx` - Danh sách sân
- `BookingHistoryPage.tsx` - Lịch sử đặt sân

#### `owner/` - Owner pages *(coming soon)*
Trang dành cho chủ sân:

- `MyVenuesPage.tsx` - Quản lý sân của tôi
- `BookingsPage.tsx` - Quản lý đặt sân
- `RevenuePage.tsx` - Thống kê doanh thu

#### Common pages
- `HomePage.tsx` - Trang chủ
- `ProfilePage.tsx` - Trang profile

---

### `src/services/`
Services được chia theo domain:

- **`admin/`** - Admin services
  - `user.admin.service.ts` - Quản lý users
  
- **`booking/`** - Booking services *(coming soon)*
  - API calls cho đặt sân
  
- **`venue/`** - Venue services *(coming soon)*
  - API calls cho quản lý sân
  
- **`payment/`** - Payment services *(coming soon)*
  - API calls cho thanh toán

- `auth.service.ts` - Authentication
- `user.service.ts` - User profile

---

## 🎯 Import Examples

### Import từ components
```typescript
// Import UI components
import { ConfirmDialog, AuthModal, Header } from '@/components';

// Import layouts
import { AdminLayout } from '@/components';

// Import feature components
import { UserDetailModal } from '@/components';
```

### Import từ pages
```typescript
import { AdminDashboardPage, AdminUsersPage, HomePage } from '@/pages';
```

### Import từ services
```typescript
import { adminService } from '@/services/admin/user.admin.service';
import { authService } from '@/services/auth.service';
```

---

## 📝 Naming Conventions

### Components
- **PascalCase**: `UserDetailModal.tsx`
- **Descriptive names**: Tên phải mô tả rõ chức năng
- **Suffix**: Modal, Dialog, Form, Card, etc.

### Pages
- **PascalCase + Page suffix**: `DashboardPage.tsx`
- **No role prefix in filename**: ~~`AdminDashboardPage.tsx`~~ → `DashboardPage.tsx`
  (Role được thể hiện qua folder structure)

### Services
- **camelCase + .service.ts**: `user.service.ts`
- **Domain-specific**: Đặt trong folder tương ứng

---

## 🚀 Adding New Features

### 1. Tạo component mới
```bash
# Tạo trong folder features tương ứng
src/components/features/booking/BookingForm.tsx
```

### 2. Tạo page mới
```bash
# Tạo trong folder role tương ứng
src/pages/client/BookingPage.tsx
```

### 3. Tạo service mới
```bash
# Tạo trong folder domain tương ứng
src/services/booking/booking.service.ts
```

### 4. Export trong index.ts
```typescript
// src/components/index.ts
export { default as BookingForm } from './features/booking/BookingForm';
```

---

## ✅ Best Practices

1. **Single Responsibility**: Mỗi component chỉ làm một việc
2. **Reusability**: UI components phải có thể tái sử dụng
3. **Consistency**: Tuân thủ naming conventions
4. **Documentation**: Comment cho logic phức tạp
5. **Type Safety**: Sử dụng TypeScript types đầy đủ

---

## 📦 Folder Status

- ✅ **Ready**: admin, ui, layouts
- 🚧 **Coming Soon**: booking, venue, payment, client pages, owner pages

---

*Last updated: 2025-12-06*
