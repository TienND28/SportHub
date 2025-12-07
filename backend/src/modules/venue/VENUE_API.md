# Venue API Documentation

## Tổng quan

API quản lý sân thể thao với đầy đủ chức năng CRUD, phân trang, filter, search và phân quyền theo role.

## Base URL

```
http://localhost:3000/api/venues
```

## Authentication

Hầu hết các endpoints đều hỗ trợ cả public và authenticated access với các quyền khác nhau:

- **Public/Customer**: Chỉ xem được venues có `is_active = true`
- **Owner**: Xem và quản lý venues của mình
- **Admin**: Xem và quản lý tất cả venues

## Endpoints

### 1. Lấy danh sách venues (GET /)

**URL**: `GET /api/venues`

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| page | number | No | Số trang (default: 1) | `?page=1` |
| limit | number | No | Số items mỗi trang (default: 10, max: 100) | `?limit=20` |
| search | string | No | Tìm kiếm theo tên sân | `?search=sân bóng` |
| is_active | boolean | No | Filter theo trạng thái active | `?is_active=true` |
| is_under_maintenance | boolean | No | Filter theo trạng thái bảo trì | `?is_under_maintenance=false` |
| province_id | number | No | Filter theo tỉnh/thành phố | `?province_id=1` |
| district_id | number | No | Filter theo quận/huyện | `?district_id=5` |
| ward_id | number | No | Filter theo phường/xã | `?ward_id=50` |
| owner_id | string | No | Filter theo chủ sân (chỉ admin) | `?owner_id=uuid` |
| sortBy | string | No | Trường để sort (name, created_at, updated_at) | `?sortBy=name` |
| sortOrder | string | No | Thứ tự sort (asc, desc) | `?sortOrder=asc` |

**Example Request**:
```bash
GET /api/venues?page=1&limit=10&search=sân&province_id=1&sortBy=name&sortOrder=asc
```

**Example Response**:
```json
{
  "success": true,
  "message": "Lấy danh sách sân thành công",
  "data": [
    {
      "id": "uuid",
      "owner_id": "uuid",
      "name": "Sân bóng ABC",
      "description": "Sân bóng đá mini chất lượng cao",
      "address": "123 Đường XYZ",
      "lat": 21.0285,
      "lng": 105.8542,
      "image": "https://example.com/image.jpg",
      "is_active": true,
      "is_under_maintenance": false,
      "province_id": 1,
      "district_id": 5,
      "ward_id": 50,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "opening_time": "2024-01-01T08:00:00.000Z",
      "closing_time": "2024-01-01T22:00:00.000Z",
      "provinces": {
        "id": 1,
        "code": "01",
        "name": "Hà Nội"
      },
      "districts": {
        "id": 5,
        "code": "001",
        "name": "Ba Đình"
      },
      "wards": {
        "id": 50,
        "code": "00001",
        "name": "Phường Điện Biên"
      },
      "users": {
        "id": "uuid",
        "full_name": "Nguyễn Văn A",
        "email": "owner@example.com",
        "phone": "0123456789"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2. Lấy chi tiết venue (GET /:id)

**URL**: `GET /api/venues/:id`

**Parameters**:
- `id` (UUID): ID của venue

**Example Request**:
```bash
GET /api/venues/123e4567-e89b-12d3-a456-426614174000
```

**Example Response**:
```json
{
  "success": true,
  "message": "Lấy thông tin sân thành công",
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "name": "Sân bóng ABC",
    // ... (giống như trên)
  }
}
```

**Error Responses**:
- `400`: ID không hợp lệ
- `404`: Không tìm thấy sân
- `403`: Không có quyền xem sân này (owner xem sân của người khác)

---

### 3. Tìm kiếm venues (GET /search)

**URL**: `GET /api/venues/search`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| keyword | string | **Yes** | Từ khóa tìm kiếm (min 2 ký tự) |
| page | number | No | Số trang |
| limit | number | No | Số items mỗi trang |
| province_id | number | No | Filter theo tỉnh |
| district_id | number | No | Filter theo quận |
| ward_id | number | No | Filter theo phường |

**Example Request**:
```bash
GET /api/venues/search?keyword=sân bóng&province_id=1&page=1&limit=10
```

**Example Response**: (Giống GET /)

---

### 4. Lấy venues của owner (GET /owner/:ownerId)

**URL**: `GET /api/venues/owner/:ownerId`

**Authentication**: Required (chỉ owner đó hoặc admin)

**Parameters**:
- `ownerId` (UUID): ID của owner

**Query Parameters**: (Giống GET /)

**Example Request**:
```bash
GET /api/venues/owner/123e4567-e89b-12d3-a456-426614174000?page=1&limit=10
```

---

### 5. Tạo venue mới (POST /)

**URL**: `POST /api/venues`

**Authentication**: Required (owner hoặc admin)

**Request Body**:

```json
{
  "name": "Sân bóng ABC",                    // Required, min 3 chars, max 255 chars
  "description": "Mô tả sân",                // Optional
  "address": "123 Đường XYZ",                // Optional
  "lat": 21.0285,                            // Optional, -90 to 90
  "lng": 105.8542,                           // Optional, -180 to 180
  "image": "https://example.com/image.jpg",  // Optional
  "province_id": 1,                          // Optional, positive integer
  "district_id": 5,                          // Optional, positive integer
  "ward_id": 50,                             // Optional, positive integer
  "opening_time": "08:00",                   // Optional, HH:mm format
  "closing_time": "22:00"                    // Optional, HH:mm format
}
```

**Validation Rules**:
- `name`: Required, 3-255 ký tự
- `lat`: -90 đến 90
- `lng`: -180 đến 180
- `province_id`, `district_id`, `ward_id`: Số nguyên dương
- `opening_time`, `closing_time`: Format HH:mm (ví dụ: 08:00, 22:00)
- `opening_time` phải nhỏ hơn `closing_time`

**Example Response**:
```json
{
  "success": true,
  "message": "Tạo sân mới thành công",
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "name": "Sân bóng ABC",
    // ... (thông tin venue vừa tạo)
  }
}
```

**Error Responses**:
- `400`: Dữ liệu không hợp lệ
- `401`: Chưa đăng nhập
- `403`: Không có quyền (không phải owner hoặc admin)

---

### 6. Cập nhật venue (PUT /:id)

**URL**: `PUT /api/venues/:id`

**Authentication**: Required (owner của venue hoặc admin)

**Parameters**:
- `id` (UUID): ID của venue

**Request Body**: (Tất cả fields đều optional)

```json
{
  "name": "Sân bóng ABC Updated",
  "description": "Mô tả mới",
  "address": "456 Đường ABC",
  "lat": 21.0285,
  "lng": 105.8542,
  "image": "https://example.com/new-image.jpg",
  "is_active": true,
  "is_under_maintenance": false,
  "province_id": 1,
  "district_id": 5,
  "ward_id": 50,
  "opening_time": "07:00",
  "closing_time": "23:00"
}
```

**Validation Rules**: (Giống POST, nhưng tất cả đều optional)

**Example Response**:
```json
{
  "success": true,
  "message": "Cập nhật thông tin sân thành công",
  "data": {
    // ... (thông tin venue sau khi cập nhật)
  }
}
```

**Error Responses**:
- `400`: Dữ liệu không hợp lệ hoặc không có gì để cập nhật
- `401`: Chưa đăng nhập
- `403`: Không có quyền (owner xem sân của người khác)
- `404`: Không tìm thấy sân

---

### 7. Xóa venue (DELETE /:id)

**URL**: `DELETE /api/venues/:id`

**Authentication**: Required (owner của venue hoặc admin)

**Parameters**:
- `id` (UUID): ID của venue

**Example Request**:
```bash
DELETE /api/venues/123e4567-e89b-12d3-a456-426614174000
```

**Example Response**:
```json
{
  "success": true,
  "message": "Xóa sân thành công",
  "data": null
}
```

**Error Responses**:
- `400`: ID không hợp lệ
- `401`: Chưa đăng nhập
- `403`: Không có quyền
- `404`: Không tìm thấy sân

---

## Phân quyền chi tiết

### Public / Customer
- ✅ GET /: Xem danh sách venues (chỉ `is_active = true`)
- ✅ GET /:id: Xem chi tiết venue (chỉ `is_active = true`)
- ✅ GET /search: Tìm kiếm venues (chỉ `is_active = true`)
- ❌ GET /owner/:ownerId: Không có quyền
- ❌ POST /: Không có quyền
- ❌ PUT /:id: Không có quyền
- ❌ DELETE /:id: Không có quyền

### Owner
- ✅ GET /: Xem danh sách venues của mình (tất cả trạng thái)
- ✅ GET /:id: Xem chi tiết venue của mình
- ✅ GET /search: Tìm kiếm venues của mình
- ✅ GET /owner/:ownerId: Xem venues của mình (nếu ownerId = user.id)
- ✅ POST /: Tạo venue mới
- ✅ PUT /:id: Cập nhật venue của mình
- ✅ DELETE /:id: Xóa venue của mình

### Admin
- ✅ GET /: Xem tất cả venues (tất cả trạng thái)
- ✅ GET /:id: Xem chi tiết bất kỳ venue nào
- ✅ GET /search: Tìm kiếm tất cả venues
- ✅ GET /owner/:ownerId: Xem venues của bất kỳ owner nào
- ✅ POST /: Tạo venue mới
- ✅ PUT /:id: Cập nhật bất kỳ venue nào
- ✅ DELETE /:id: Xóa bất kỳ venue nào

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (chưa đăng nhập) |
| 403 | Forbidden (không có quyền) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Examples

### Example 1: Customer tìm kiếm sân ở Hà Nội

```bash
GET /api/venues/search?keyword=sân bóng&province_id=1&page=1&limit=10
```

### Example 2: Owner xem danh sách sân của mình

```bash
GET /api/venues
Authorization: Bearer <token>
```

### Example 3: Owner tạo sân mới

```bash
POST /api/venues
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sân bóng XYZ",
  "address": "123 Đường ABC, Hà Nội",
  "province_id": 1,
  "district_id": 5,
  "ward_id": 50,
  "opening_time": "06:00",
  "closing_time": "23:00"
}
```

### Example 4: Admin filter venues đang bảo trì

```bash
GET /api/venues?is_under_maintenance=true&page=1&limit=20
Authorization: Bearer <admin-token>
```

### Example 5: Owner cập nhật trạng thái sân

```bash
PUT /api/venues/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_active": false,
  "is_under_maintenance": true
}
```
