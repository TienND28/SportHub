# Venue Management UI

## Tổng quan

Hệ thống quản lý sân thể thao với 3 giao diện chính:
- **Customer**: Xem và tìm kiếm sân
- **Owner**: Quản lý sân của mình
- **Admin**: Quản lý tất cả sân trong hệ thống

## Cấu trúc

```
frontend/src/
├── services/
│   └── venue.service.ts          # Service xử lý API calls
├── pages/
│   ├── customer/
│   │   └── VenuesPage.tsx        # Trang khách hàng xem sân
│   ├── owner/
│   │   └── MyVenuesPage.tsx      # Trang chủ sân quản lý
│   └── admin/
│       └── VenuesPage.tsx        # Trang admin quản lý tất cả sân
```

## Tính năng

### 1. Customer - Venues Page (`/venues`)

**Chức năng:**
- Xem danh sách tất cả sân đang hoạt động
- Tìm kiếm sân theo tên
- Lọc và sắp xếp kết quả
- Phân trang

**UI Features:**
- Card-based layout với hình ảnh
- Gradient màu xanh dương/indigo
- Hiển thị thông tin: tên, mô tả, địa chỉ, giờ hoạt động
- Badge "Bảo trì" cho sân đang bảo trì
- Responsive design

### 2. Owner - My Venues Page (`/owner/venues`)

**Chức năng:**
- Xem danh sách sân của mình
- Thêm sân mới
- Chỉnh sửa thông tin sân
- Xóa sân
- Bật/tắt trạng thái hoạt động

**UI Features:**
- Card-based layout
- Gradient màu tím/hồng
- Modal form để thêm/sửa sân
- Toggle button cho trạng thái active
- Empty state với CTA button

**Form Fields:**
- Tên sân (required)
- Mô tả
- Địa chỉ
- Giờ mở cửa / đóng cửa
- URL hình ảnh

### 3. Admin - Venues Management (`/admin/venues`)

**Chức năng:**
- Xem tất cả sân trong hệ thống
- Tìm kiếm và lọc sân
- Bật/tắt trạng thái hoạt động
- Toggle trạng thái bảo trì
- Xóa sân
- Xem thông tin chủ sân

**UI Features:**
- Table-based layout
- Gradient màu cam/đỏ
- Filters: trạng thái, sắp xếp, số lượng/trang
- Inline status toggle
- Phân trang

## API Integration

Service `venue.service.ts` cung cấp các methods:

```typescript
// Get all venues
getAllVenues(filters?: VenueFilters): Promise<VenuesResponse>

// Search venues
searchVenues(keyword: string, filters?): Promise<VenuesResponse>

// Get venue by ID
getVenueById(id: string): Promise<VenueResponse>

// Get venues by owner ID
getVenuesByOwnerId(ownerId: string, filters?): Promise<VenuesResponse>

// Create venue
createVenue(data: CreateVenueDto): Promise<VenueResponse>

// Update venue
updateVenue(id: string, data: UpdateVenueDto): Promise<VenueResponse>

// Delete venue
deleteVenue(id: string): Promise<Response>
```

## Types

```typescript
interface Venue {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  address?: string;
  lat?: number;
  lng?: number;
  image?: string;
  is_active: boolean;
  is_under_maintenance: boolean;
  province_id?: number;
  district_id?: number;
  ward_id?: number;
  opening_time?: string;
  closing_time?: string;
  created_at: string;
  updated_at: string;
  // Relations
  provinces?: Location;
  districts?: Location;
  wards?: Location;
  users?: Owner;
}

interface VenueFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  is_under_maintenance?: boolean;
  province_id?: number;
  district_id?: number;
  ward_id?: number;
  owner_id?: string;
  sortBy?: "name" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}
```

## Styling

**Design System:**
- Tailwind CSS
- Gradient backgrounds
- Smooth transitions và hover effects
- Responsive breakpoints
- Icons từ @heroicons/react

**Color Schemes:**
- Customer: Blue/Indigo gradient
- Owner: Purple/Pink gradient
- Admin: Orange/Red gradient

## Usage

### Thêm vào Routes

```typescript
import { VenuesPage, MyVenuesPage, AdminVenuesPage } from './pages';

// Customer route
<Route path="/venues" element={<VenuesPage />} />

// Owner route (protected)
<Route path="/owner/venues" element={<MyVenuesPage />} />

// Admin route (protected)
<Route path="/admin/venues" element={<AdminVenuesPage />} />
```

### Environment Variables

Đảm bảo có biến môi trường:

```env
VITE_API_URL=http://localhost:3000
```

## Dependencies

```json
{
  "@heroicons/react": "^2.x",
  "axios": "^1.x",
  "react-toastify": "^9.x"
}
```

## Best Practices

1. **Error Handling**: Tất cả API calls đều có try-catch với toast notifications
2. **Loading States**: Spinner hiển thị khi đang tải dữ liệu
3. **Empty States**: UI thân thiện khi không có dữ liệu
4. **Confirmation**: Xác nhận trước khi xóa
5. **Responsive**: Hoạt động tốt trên mobile, tablet, desktop

## Future Enhancements

- [ ] Upload hình ảnh thay vì URL
- [ ] Map integration để chọn vị trí
- [ ] Bulk actions cho admin
- [ ] Export data
- [ ] Advanced filters (theo khoảng cách, đánh giá, v.v.)
- [ ] Venue detail page
- [ ] Image gallery
- [ ] Reviews & ratings
