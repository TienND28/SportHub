# HƯỚNG DẪN LUỒNG HOẠT ĐỘNG FRONTEND - SPORTHUB

## 📋 MỤC LỤC
1. [Tổng quan về kiến trúc Frontend](#1-tổng-quan-về-kiến-trúc-frontend)
2. [So sánh luồng Backend vs Frontend](#2-so-sánh-luồng-backend-vs-frontend)
3. [Các thành phần chính trong Frontend](#3-các-thành-phần-chính-trong-frontend)
4. [Luồng hoạt động chi tiết](#4-luồng-hoạt-động-chi-tiết)
5. [Hướng dẫn tạo một feature mới (CRUD)](#5-hướng-dẫn-tạo-một-feature-mới-crud)
6. [Best Practices](#6-best-practices)

---

## 1. TỔNG QUAN VỀ KIẾN TRÚC FRONTEND

### Cấu trúc thư mục Frontend
```
frontend/src/
├── app/                    # Entry point của ứng dụng
│   └── App.tsx            # Định nghĩa routes chính
├── pages/                  # Các trang (Views)
│   ├── admin/             # Trang dành cho Admin
│   ├── owner/             # Trang dành cho Owner
│   ├── customer/          # Trang dành cho Customer
│   └── common/            # Trang chung (Home, Profile, etc.)
├── components/            # Các component tái sử dụng
│   ├── features/          # Component theo feature
│   ├── layouts/           # Layout components
│   └── ui/                # UI components cơ bản
├── services/              # API services (gọi Backend)
├── contexts/              # React Context (State management)
├── hooks/                 # Custom React Hooks
├── types/                 # TypeScript types/interfaces
└── styles/                # CSS/Styling files
```

---

## 2. SO SÁNH LUỒNG BACKEND VS FRONTEND

### Backend Flow (Server-side)
```
Request → Server → Routes → Middleware → Controller → Service → Database
                                                          ↓
Response ← Server ← Routes ← Controller ← Service ← Database
```

### Frontend Flow (Client-side)
```
User Action → Page/Component → Service → API Call → Backend
                ↓                                      ↓
            State Update ← Service ← Response ← Backend
                ↓
            Re-render UI
```

### Chi tiết từng layer:

| Backend | Frontend | Mô tả |
|---------|----------|-------|
| **Server** (server.ts) | **App** (App.tsx) | Entry point, khởi tạo ứng dụng |
| **Routes** (*.routes.ts) | **Routes** (App.tsx) | Định nghĩa các đường dẫn |
| **Middleware** | **ProtectedRoute, Context** | Xác thực, phân quyền |
| **Controller** | **Page/Component** | Xử lý logic nghiệp vụ |
| **Service** | **Service** (*.service.ts) | Gọi API, xử lý data |
| **Database** | **Backend API** | Nguồn dữ liệu |

---

## 3. CÁC THÀNH PHẦN CHÍNH TRONG FRONTEND

### 3.1. App.tsx - Router Configuration
**Vai trò**: Giống như `server.ts` trong Backend
- Định nghĩa tất cả routes
- Cấu hình providers (AuthProvider, ToastContainer)
- Bảo vệ routes với ProtectedRoute

```tsx
// App.tsx
<BrowserRouter>
  <AuthProvider>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
    </Routes>
    <ToastContainer />
  </AuthProvider>
</BrowserRouter>
```

### 3.2. Services - API Communication Layer
**Vai trò**: Giống như `Service` trong Backend, nhưng gọi API thay vì truy cập Database
- Gọi API endpoints
- Xử lý request/response
- Định nghĩa types cho data

```typescript
// services/venue.service.ts
class VenueService {
    async getAllVenues(filters?: VenueFilters): Promise<VenuesResponse> {
        const response = await axios.get(`${API_URL}/api/venues`, {
            params: filters,
            withCredentials: true
        });
        return response.data;
    }

    async createVenue(data: CreateVenueDto): Promise<VenueResponse> {
        const response = await apiClient.post(`/venues`, data)
        return response.data;
    }
}
```

### 3.3. Pages - View Layer
**Vai trò**: Giống như `Controller` trong Backend
- Xử lý user interactions
- Gọi services
- Quản lý state
- Render UI

```tsx
// pages/owner/MyVenuesPage.tsx
function MyVenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchVenues = async () => {
        setLoading(true);
        try {
            const response = await venueService.getAllVenues();
            setVenues(response.data);
        } catch (error) {
            toast.error('Failed to load venues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    return (
        <div>
            {loading ? <Spinner /> : <VenueList venues={venues} />}
        </div>
    );
}
```

### 3.4. Contexts - Global State Management
**Vai trò**: Giống như `Middleware` trong Backend (authentication, authorization)
- Quản lý state toàn cục (user, auth token)
- Cung cấp functions cho toàn app
- Persist data (localStorage)

```tsx
// contexts/AuthContext.tsx
export function AuthProvider({ children }) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const login = async (email: string, password: string) => {
        const response = await authService.login({ email, password });
        setUser(response.data.user);
        setAccessToken(response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
```

### 3.5. Components - Reusable UI Components
**Vai trò**: Các thành phần UI có thể tái sử dụng
- UI components (Button, Input, Card)
- Feature components (VenueCard, UserTable)
- Layout components (AdminLayout, Navbar)

```tsx
// components/features/venue/VenueCard.tsx
export function VenueCard({ venue }: { venue: Venue }) {
    return (
        <div className="venue-card">
            <h3>{venue.name}</h3>
            <p>{venue.description}</p>
            <button onClick={() => handleEdit(venue.id)}>Edit</button>
        </div>
    );
}
```

### 3.6. Hooks - Custom Logic Reuse
**Vai trò**: Tái sử dụng logic giữa các components
- Custom hooks cho API calls
- Form handling
- Data fetching

```tsx
// hooks/useVenues.ts
export function useVenues(filters?: VenueFilters) {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVenues = async () => {
        setLoading(true);
        try {
            const response = await venueService.getAllVenues(filters);
            setVenues(response.data);
        } catch (err) {
            setError('Failed to fetch venues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, [filters]);

    return { venues, loading, error, refetch: fetchVenues };
}
```

---

## 4. LUỒNG HOẠT ĐỘNG CHI TIẾT

### Ví dụ: User xem danh sách Venues

```
1. USER clicks "Venues" menu
   ↓
2. React Router navigates to /venues
   ↓
3. VenuesPage component mounts
   ↓
4. useEffect() triggers on mount
   ↓
5. Call venueService.getAllVenues()
   ↓
6. Service makes HTTP GET request to Backend API
   ↓
7. Backend processes request (Routes → Controller → Service → DB)
   ↓
8. Backend returns JSON response
   ↓
9. Service receives response
   ↓
10. Page updates state with setVenues(response.data)
    ↓
11. React re-renders UI with new data
    ↓
12. USER sees the venues list
```

### Ví dụ: User tạo mới Venue (CREATE)

```
1. USER fills form and clicks "Create Venue"
   ↓
2. handleSubmit() function is called
   ↓
3. Validate form data (client-side)
   ↓
4. Call venueService.createVenue(formData)
   ↓
5. Service makes HTTP POST request to Backend
   ↓
6. Backend validates and creates venue in DB
   ↓
7. Backend returns success response with new venue
   ↓
8. Service receives response
   ↓
9. Show success toast notification
   ↓
10. Update local state or refetch venues list
    ↓
11. React re-renders UI
    ↓
12. USER sees new venue in the list
```

---

## 5. HƯỚNG DẪN TẠO MỘT FEATURE MỚI (CRUD)

Giả sử bạn muốn tạo feature quản lý **Courts** (Sân thể thao)

### Bước 1: Tạo Service (API Layer)
**File**: `src/services/court.service.ts`

```typescript
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 1. Định nghĩa Types/Interfaces
export interface Court {
    id: string;
    venue_id: string;
    name: string;
    court_type: string;
    price_per_hour: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateCourtDto {
    venue_id: string;
    name: string;
    court_type: string;
    price_per_hour: number;
}

export interface UpdateCourtDto {
    name?: string;
    court_type?: string;
    price_per_hour?: number;
    is_active?: boolean;
}

export interface CourtsResponse {
    success: boolean;
    message: string;
    data: Court[];
}

export interface CourtResponse {
    success: boolean;
    message: string;
    data: Court;
}

// 2. Tạo Service Class
class CourtService {
    // READ - Get all courts
    async getAllCourts(venueId?: string): Promise<CourtsResponse> {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await axios.get(`${API_URL}/api/courts`, {
            params,
            withCredentials: true,
        });
        return response.data;
    }

    // READ - Get court by ID
    async getCourtById(id: string): Promise<CourtResponse> {
        const response = await axios.get(`${API_URL}/api/courts/${id}`, {
            withCredentials: true,
        });
        return response.data;
    }

    // CREATE - Create new court
    async createCourt(data: CreateCourtDto): Promise<CourtResponse> {
        const response = await axios.post(`${API_URL}/api/courts`, data, {
            withCredentials: true,
        });
        return response.data;
    }

    // UPDATE - Update court
    async updateCourt(id: string, data: UpdateCourtDto): Promise<CourtResponse> {
        const response = await axios.put(`${API_URL}/api/courts/${id}`, data, {
            withCredentials: true,
        });
        return response.data;
    }

    // DELETE - Delete court
    async deleteCourt(id: string): Promise<{ success: boolean; message: string }> {
        const response = await axios.delete(`${API_URL}/api/courts/${id}`, {
            withCredentials: true,
        });
        return response.data;
    }
}

// 3. Export singleton instance
export default new CourtService();
```

---

### Bước 2: Tạo Custom Hook (Optional nhưng recommended)
**File**: `src/hooks/useCourts.ts`

```typescript
import { useState, useEffect } from 'react';
import courtService, { Court } from '../services/court.service';
import { toast } from 'react-toastify';

export function useCourts(venueId?: string) {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCourts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await courtService.getAllCourts(venueId);
            setCourts(response.data);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to fetch courts';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourts();
    }, [venueId]);

    return {
        courts,
        loading,
        error,
        refetch: fetchCourts,
    };
}
```

---

### Bước 3: Tạo Components
**File**: `src/components/features/court/CourtCard.tsx`

```tsx
import React from 'react';
import { Court } from '../../../services/court.service';

interface CourtCardProps {
    court: Court;
    onEdit: (court: Court) => void;
    onDelete: (id: string) => void;
}

export function CourtCard({ court, onEdit, onDelete }: CourtCardProps) {
    return (
        <div className="court-card">
            <h3>{court.name}</h3>
            <p>Type: {court.court_type}</p>
            <p>Price: ${court.price_per_hour}/hour</p>
            <p>Status: {court.is_active ? 'Active' : 'Inactive'}</p>
            <div className="actions">
                <button onClick={() => onEdit(court)}>Edit</button>
                <button onClick={() => onDelete(court.id)}>Delete</button>
            </div>
        </div>
    );
}
```

**File**: `src/components/features/court/CourtForm.tsx`

```tsx
import React, { useState } from 'react';
import { CreateCourtDto } from '../../../services/court.service';

interface CourtFormProps {
    venueId: string;
    onSubmit: (data: CreateCourtDto) => void;
    onCancel: () => void;
}

export function CourtForm({ venueId, onSubmit, onCancel }: CourtFormProps) {
    const [formData, setFormData] = useState<CreateCourtDto>({
        venue_id: venueId,
        name: '',
        court_type: '',
        price_per_hour: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price_per_hour' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Court Name:</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Court Type:</label>
                <input
                    type="text"
                    name="court_type"
                    value={formData.court_type}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Price per Hour:</label>
                <input
                    type="number"
                    name="price_per_hour"
                    value={formData.price_per_hour}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                />
            </div>
            <div className="form-actions">
                <button type="submit">Create Court</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}
```

---

### Bước 4: Tạo Page (View)
**File**: `src/pages/owner/CourtsPage.tsx`

```tsx
import React, { useState } from 'react';
import { useCourts } from '../../hooks/useCourts';
import { CourtCard } from '../../components/features/court/CourtCard';
import { CourtForm } from '../../components/features/court/CourtForm';
import courtService, { Court, CreateCourtDto } from '../../services/court.service';
import { toast } from 'react-toastify';

export function CourtsPage() {
    const [venueId] = useState('your-venue-id'); // Get from route params or context
    const { courts, loading, refetch } = useCourts(venueId);
    const [showForm, setShowForm] = useState(false);
    const [editingCourt, setEditingCourt] = useState<Court | null>(null);

    // CREATE
    const handleCreate = async (data: CreateCourtDto) => {
        try {
            await courtService.createCourt(data);
            toast.success('Court created successfully!');
            setShowForm(false);
            refetch(); // Refresh the list
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create court');
        }
    };

    // UPDATE
    const handleEdit = (court: Court) => {
        setEditingCourt(court);
        setShowForm(true);
    };

    const handleUpdate = async (id: string, data: any) => {
        try {
            await courtService.updateCourt(id, data);
            toast.success('Court updated successfully!');
            setEditingCourt(null);
            setShowForm(false);
            refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update court');
        }
    };

    // DELETE
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this court?')) return;

        try {
            await courtService.deleteCourt(id);
            toast.success('Court deleted successfully!');
            refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete court');
        }
    };

    if (loading) {
        return <div>Loading courts...</div>;
    }

    return (
        <div className="courts-page">
            <div className="header">
                <h1>Manage Courts</h1>
                <button onClick={() => setShowForm(true)}>Add New Court</button>
            </div>

            {showForm && (
                <div className="modal">
                    <CourtForm
                        venueId={venueId}
                        onSubmit={handleCreate}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingCourt(null);
                        }}
                    />
                </div>
            )}

            <div className="courts-grid">
                {courts.map(court => (
                    <CourtCard
                        key={court.id}
                        court={court}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
}
```

---

### Bước 5: Thêm Route vào App.tsx
**File**: `src/app/App.tsx`

```tsx
import { CourtsPage } from '../pages/owner/CourtsPage';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Existing routes */}
                    <Route path="/" element={<HomePage />} />
                    
                    {/* New Courts route */}
                    <Route 
                        path="/owner/courts" 
                        element={
                            <ProtectedRoute>
                                <CourtsPage />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
```

---

### Bước 6: Export từ index.ts (Optional)
**File**: `src/pages/index.ts`

```typescript
// Add to existing exports
export { CourtsPage } from './owner/CourtsPage';
```

---

## 6. BEST PRACTICES

### 6.1. Error Handling
```typescript
// Always use try-catch with toast notifications
try {
    const response = await courtService.createCourt(data);
    toast.success('Success!');
} catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Something went wrong';
    toast.error(errorMsg);
}
```

### 6.2. Loading States
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
    setLoading(true);
    try {
        // API call
    } finally {
        setLoading(false); // Always set loading to false
    }
};

return loading ? <Spinner /> : <DataComponent />;
```

### 6.3. Type Safety
```typescript
// Always define types for API responses
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Use generics for reusable types
async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
    const response = await axios.get(url);
    return response.data;
}
```

### 6.4. Separation of Concerns
- **Services**: Chỉ gọi API, không có UI logic
- **Hooks**: Quản lý state và side effects
- **Components**: Chỉ render UI, nhận props
- **Pages**: Kết hợp hooks, services, components

### 6.5. Reusability
```typescript
// Bad: Duplicate code
function VenuesPage() {
    const [venues, setVenues] = useState([]);
    useEffect(() => {
        fetchVenues();
    }, []);
}

function CourtsPage() {
    const [courts, setCourts] = useState([]);
    useEffect(() => {
        fetchCourts();
    }, []);
}

// Good: Reusable hook
function useApiData<T>(fetchFn: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        fetchFn().then(setData).finally(() => setLoading(false));
    }, []);
    
    return { data, loading };
}
```

---

## 7. TÓM TẮT LUỒNG HOẠT ĐỘNG

### Để tạo một feature CRUD hoàn chỉnh, bạn cần:

1. **Service** (`*.service.ts`): Định nghĩa API calls
2. **Types** (trong service file): Định nghĩa interfaces
3. **Hook** (`use*.ts`): Quản lý state và logic (optional)
4. **Components** (`components/features/*`): UI components
5. **Page** (`pages/*`): Kết hợp tất cả lại
6. **Route** (`App.tsx`): Thêm route mới

### Luồng xử lý:
```
User Action → Page → Hook → Service → API → Backend
                ↓                              ↓
            Update State ← Service ← Response ← Backend
                ↓
            Re-render UI
```

---

## 8. CHECKLIST KHI TẠO FEATURE MỚI

- [ ] Tạo service file với tất cả CRUD operations
- [ ] Định nghĩa TypeScript interfaces/types
- [ ] Tạo custom hook (nếu cần)
- [ ] Tạo UI components (Card, Form, List)
- [ ] Tạo page component
- [ ] Thêm route vào App.tsx
- [ ] Thêm error handling với toast
- [ ] Thêm loading states
- [ ] Test tất cả CRUD operations
- [ ] Thêm validation cho forms
- [ ] Thêm confirmation cho delete actions

---

**Chúc bạn code vui vẻ! 🚀**
