# 📚 HƯỚNG DẪN: QUY TRÌNH HOÀN THIỆN MỘT CHỨC NĂNG KẾT NỐI API

## 🎯 Tổng Quan
Tài liệu này hướng dẫn chi tiết các bước để tạo một chức năng hoàn chỉnh kết nối với API, từ Backend đến Frontend.

---

## 📋 BƯỚC 1: KIỂM TRA/TẠO BACKEND API

### 1.1. Kiểm tra API đã tồn tại chưa
- Mở file `backend/src/modules/[module]/[module].router.ts`
- Kiểm tra xem endpoint cần thiết đã có chưa
- Ví dụ: `/api/users/admin/all` cho chức năng lấy danh sách users

### 1.2. Nếu API chưa có, tạo mới theo thứ tự:

#### a) **DTO (Data Transfer Object)** - `[module].dto.ts`
```typescript
// Định nghĩa cấu trúc dữ liệu input/output
export class GetAllUsersQueryDto {
    @IsOptional()
    @IsString()
    search?: string;
    
    @IsOptional()
    @IsIn(['user', 'organizer', 'admin'])
    role?: string;
    
    // ... các trường khác
}

export interface PaginatedUsersResponse {
    users: UserResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
```

#### b) **Service** - `[module].service.ts`
```typescript
// Logic xử lý nghiệp vụ
export const UserService = {
    async getAllUsers(filters: GetAllUsersParams) {
        // 1. Xây dựng query conditions
        const where: any = {};
        if (filters.search) {
            where.OR = [
                { email: { contains: filters.search } },
                { full_name: { contains: filters.search } }
            ];
        }
        
        // 2. Pagination
        const skip = (filters.page - 1) * filters.limit;
        
        // 3. Query database
        const users = await prisma.users.findMany({
            where,
            skip,
            take: filters.limit,
            orderBy: { [filters.sortBy]: filters.sortOrder }
        });
        
        // 4. Return formatted data
        return {
            users: users.map(toUserResponse),
            pagination: { ... }
        };
    }
};
```

#### c) **Controller** - `[module].controller.ts`
```typescript
// Xử lý HTTP request/response
export class UserController {
    getAllUsers = async (
        req: FastifyRequest<{ Querystring: GetAllUsersQueryDto }>,
        reply: FastifyReply
    ) => {
        try {
            // 1. Parse & validate query params
            const filters = { ...req.query };
            
            // 2. Call service
            const result = await UserService.getAllUsers(filters);
            
            // 3. Send success response
            return sendSuccessWithPagination(reply, result.users, result.pagination);
        } catch (e) {
            // 4. Handle errors
            logger.error('getAllUsers', 'Failed', e);
            return sendError(reply, e as Error);
        }
    };
}
```

#### d) **Router** - `[module].router.ts`
```typescript
// Định nghĩa routes và middleware
export async function userRouter(app: FastifyInstance) {
    const userController = new UserController();
    
    app.get<{ Querystring: GetAllUsersQueryDto }>(
        '/admin/all',
        { 
            preHandler: [
                authMiddleware,      // Xác thực user
                requireAdmin,        // Kiểm tra quyền admin
                validateQuery(GetAllUsersQueryDto)  // Validate input
            ] 
        },
        userController.getAllUsers
    );
}
```

### 1.3. Test API với Thunder Client/Postman
```
GET http://localhost:3000/api/users/admin/all?page=1&limit=10&role=user
Headers:
  Cookie: jwt=<your_token>
```

---

## 📋 BƯỚC 2: TẠO SERVICE LAYER (FRONTEND)

### 2.1. Tạo file service - `frontend/src/services/[module].service.ts`

```typescript
import { apiClient } from '../lib/axios';

// 1. Định nghĩa TypeScript interfaces
export interface User {
    id: string;
    email: string;
    full_name: string;
    // ... các trường khác
}

export interface GetAllUsersParams {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedUsersResponse {
    success: boolean;
    data: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// 2. Tạo service class
class AdminService {
    /**
     * Get all users with filtering and pagination
     */
    async getAllUsers(params: GetAllUsersParams): Promise<PaginatedUsersResponse> {
        return apiClient.get('/api/users/admin/all', { params });
    }
    
    /**
     * Update user role
     */
    async updateUserRole(userId: string, role: string): Promise<{ success: boolean; data: User }> {
        return apiClient.put(`/api/users/admin/${userId}/role`, { role });
    }
    
    /**
     * Delete user
     */
    async deleteUser(userId: string): Promise<{ success: boolean }> {
        return apiClient.delete(`/api/users/admin/${userId}`);
    }
}

// 3. Export singleton instance
export const adminService = new AdminService();
```

### 2.2. Lợi ích của Service Layer
- ✅ Tách biệt logic API khỏi UI components
- ✅ Dễ dàng test và maintain
- ✅ Tái sử dụng code
- ✅ Type-safe với TypeScript
- ✅ Centralized error handling

---

## 📋 BƯỚC 3: TẠO UI COMPONENT

### 3.1. Cấu trúc Component cơ bản

```typescript
import { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import type { User, GetAllUsersParams } from '../services/admin.service';
import { toast } from 'react-toastify';

export default function AdminUsersPage() {
    // 1. STATE MANAGEMENT
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<GetAllUsersParams>({
        page: 1,
        limit: 10
    });
    
    // 2. DATA FETCHING
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminService.getAllUsers(filters);
            setUsers(response.data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };
    
    // 3. EFFECTS
    useEffect(() => {
        fetchUsers();
    }, [filters]); // Re-fetch khi filters thay đổi
    
    // 4. EVENT HANDLERS
    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value, page: 1 }));
    };
    
    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure?')) return;
        
        try {
            await adminService.deleteUser(userId);
            toast.success('User deleted successfully');
            fetchUsers(); // Refresh data
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
        }
    };
    
    // 5. RENDER
    return (
        <div>
            {/* Search & Filters */}
            <input 
                type="text"
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search..."
            />
            
            {/* Loading State */}
            {loading && <Loader />}
            
            {/* Data Display */}
            {users.map(user => (
                <div key={user.id}>
                    <span>{user.full_name}</span>
                    <button onClick={() => handleDelete(user.id)}>Delete</button>
                </div>
            ))}
        </div>
    );
}
```

### 3.2. Các Pattern quan trọng

#### a) **Loading States**
```typescript
{loading ? (
    <Loader2 className="animate-spin" />
) : users.length === 0 ? (
    <p>No data found</p>
) : (
    <DataTable data={users} />
)}
```

#### b) **Error Handling**
```typescript
try {
    const response = await adminService.getAllUsers(filters);
    setUsers(response.data);
} catch (error: any) {
    // Hiển thị error message cho user
    toast.error(error.message || 'Something went wrong');
    
    // Log error để debug
    console.error('Failed to fetch users:', error);
}
```

#### c) **Optimistic Updates** (Optional)
```typescript
const handleToggleStatus = async (user: User) => {
    // 1. Update UI ngay lập tức
    setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
    ));
    
    try {
        // 2. Gọi API
        await adminService.toggleUserStatus(user.id);
        toast.success('Status updated');
    } catch (error) {
        // 3. Rollback nếu lỗi
        setUsers(prev => prev.map(u => 
            u.id === user.id ? { ...u, is_active: user.is_active } : u
        ));
        toast.error('Failed to update status');
    }
};
```

---

## 📋 BƯỚC 4: XỬ LÝ STATE MANAGEMENT

### 4.1. Local State (useState)
Dùng cho:
- Component-specific data
- UI states (modals, dropdowns)
- Form inputs

```typescript
const [showModal, setShowModal] = useState(false);
const [selectedUser, setSelectedUser] = useState<User | null>(null);
```

### 4.2. URL State (useSearchParams)
Dùng cho:
- Filters
- Pagination
- Sorting

```typescript
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();

// Read from URL
const page = searchParams.get('page') || '1';
const search = searchParams.get('search') || '';

// Update URL
const handleSearch = (value: string) => {
    setSearchParams({ search: value, page: '1' });
};
```

### 4.3. Global State (Context API hoặc Zustand)
Dùng cho:
- User authentication
- Theme settings
- Shared data across components

---

## 📋 BƯỚC 5: STYLING & UX

### 5.1. Responsive Design
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
</div>
```

### 5.2. Loading Skeletons
```typescript
{loading ? (
    <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
) : (
    <ActualContent />
)}
```

### 5.3. Transitions & Animations
```typescript
<div className="transition-all duration-300 hover:scale-105">
    {/* Content */}
</div>
```

---

## 📋 BƯỚC 6: TESTING & DEBUGGING

### 6.1. Console Logging
```typescript
const fetchUsers = async () => {
    console.log('Fetching users with filters:', filters);
    
    try {
        const response = await adminService.getAllUsers(filters);
        console.log('API Response:', response);
        setUsers(response.data);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};
```

### 6.2. React DevTools
- Inspect component state
- Track re-renders
- Debug props

### 6.3. Network Tab
- Check API requests/responses
- Verify headers (authentication)
- Monitor loading times

---

## 🎯 CHECKLIST HOÀN THIỆN CHỨC NĂNG

### Backend ✅
- [ ] DTO đã định nghĩa đầy đủ với validation
- [ ] Service logic xử lý đúng nghiệp vụ
- [ ] Controller handle errors properly
- [ ] Router có middleware phù hợp (auth, validation)
- [ ] Test API với Thunder Client/Postman

### Frontend ✅
- [ ] Service layer với TypeScript interfaces
- [ ] Component có loading states
- [ ] Error handling với toast notifications
- [ ] Responsive design
- [ ] Accessibility (keyboard navigation, ARIA labels)
- [ ] Performance optimization (memo, useMemo, useCallback)

### UX ✅
- [ ] Loading indicators
- [ ] Success/Error messages
- [ ] Confirmation dialogs cho destructive actions
- [ ] Empty states
- [ ] Pagination/Infinite scroll
- [ ] Search debouncing

---

## 💡 TIPS & BEST PRACTICES

### 1. **Always use TypeScript**
- Định nghĩa interfaces cho tất cả data structures
- Sử dụng type-only imports khi cần thiết

### 2. **Separation of Concerns**
- Service layer cho API calls
- Components chỉ lo UI và user interactions
- Utils/helpers cho logic tái sử dụng

### 3. **Error Handling**
- Luôn có try-catch cho async operations
- Hiển thị error messages user-friendly
- Log errors để debug

### 4. **Performance**
- Debounce search inputs
- Paginate large datasets
- Lazy load images
- Memoize expensive calculations

### 5. **Accessibility**
- Semantic HTML
- Keyboard navigation
- ARIA labels
- Color contrast

---

## 📚 VÍ DỤ THỰC TẾ: CRUD OPERATIONS

### CREATE
```typescript
const handleCreate = async (data: CreateUserDto) => {
    try {
        await adminService.createUser(data);
        toast.success('User created successfully');
        setShowModal(false);
        fetchUsers(); // Refresh list
    } catch (error: any) {
        toast.error(error.message);
    }
};
```

### READ
```typescript
useEffect(() => {
    fetchUsers();
}, [filters]);
```

### UPDATE
```typescript
const handleUpdate = async (userId: string, data: UpdateUserDto) => {
    try {
        await adminService.updateUser(userId, data);
        toast.success('User updated successfully');
        fetchUsers();
    } catch (error: any) {
        toast.error(error.message);
    }
};
```

### DELETE
```typescript
const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure?')) return;
    
    try {
        await adminService.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
    } catch (error: any) {
        toast.error(error.message);
    }
};
```

---

## 🚀 NEXT STEPS

Sau khi hoàn thành User Management, bạn có thể áp dụng quy trình tương tự cho:

1. **Event Management**
   - List events với filters
   - Create/Edit/Delete events
   - Approve/Reject events

2. **Venue Management**
   - CRUD venues
   - Manage courts
   - Pricing rules

3. **Dashboard Analytics**
   - Statistics cards
   - Charts & graphs
   - Recent activities

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Check console logs
2. Verify API endpoint trong Network tab
3. Review error messages
4. Check authentication/authorization
5. Validate data format

Good luck! 🎉
