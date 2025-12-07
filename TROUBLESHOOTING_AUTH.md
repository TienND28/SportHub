# 🔧 HƯỚNG DẪN KHẮC PHỤC LỖI "No authentication token provided"

## 🎯 Nguyên nhân

Lỗi này xảy ra khi:
1. **Chưa đăng nhập** → Không có token trong localStorage
2. **Token đã hết hạn** → Cần đăng nhập lại
3. **Cookie không được gửi kèm** → Vấn đề CORS hoặc cấu hình axios

---

## 📋 BƯỚC 1: KIỂM TRA TRẠNG THÁI AUTHENTICATION

### Cách 1: Sử dụng AuthDebug Component
1. Mở trang chủ: `http://localhost:5173/`
2. Xem component debug ở góc dưới bên phải màn hình
3. Kiểm tra:
   - ✅ **Context User**: Phải có thông tin user
   - ✅ **Context Token**: Phải có JWT token
   - ✅ **LocalStorage User**: Phải có JSON user data
   - ✅ **LocalStorage Token**: Phải có JWT token
   - ✅ **Status**: Phải hiển thị "✅ Authenticated"

### Cách 2: Sử dụng Browser DevTools
1. Mở DevTools (F12)
2. Vào tab **Console**
3. Chạy lệnh:
```javascript
console.log('User:', localStorage.getItem('user'));
console.log('Token:', localStorage.getItem('accessToken'));
```

4. Nếu cả 2 đều `null` → **Bạn chưa đăng nhập**

---

## 📋 BƯỚC 2: ĐĂNG NHẬP

### Nếu chưa có tài khoản:
1. Vào trang chủ: `http://localhost:5173/`
2. Click nút **"Bắt đầu ngay"** hoặc **"Login"** ở header
3. Chọn tab **"Register"**
4. Điền thông tin:
   - Email
   - Password (tối thiểu 6 ký tự)
   - Full Name
   - Phone (optional)
5. Click **"Register"**

### Nếu đã có tài khoản:
1. Vào trang chủ: `http://localhost:5173/`
2. Click **"Login"** ở header
3. Nhập email và password
4. Click **"Login"**

### Sau khi đăng nhập thành công:
- Kiểm tra lại AuthDebug component
- Phải thấy thông tin user và token
- Status phải là "✅ Authenticated"

---

## 📋 BƯỚC 3: KIỂM TRA QUYỀN ADMIN

### Admin routes yêu cầu role = "admin"
Để truy cập `/admin` hoặc `/admin/users`, user phải có `role: "admin"`.

### Cách kiểm tra role hiện tại:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('Current role:', user?.role);
```

### Nếu role không phải "admin":
Bạn có 2 cách:

#### Cách 1: Tạo tài khoản admin mới (Recommended)
1. Vào database (Prisma Studio hoặc SQL client)
2. Tìm user vừa tạo
3. Update trường `role` thành `'admin'`
4. Logout và login lại

#### Cách 2: Tạm thời bỏ requireAdmin (Chỉ để test)
Trong file `frontend/src/app/App.tsx`:
```typescript
// Thay đổi từ:
<Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />

// Thành:
<Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
```

**⚠️ Lưu ý**: Nhớ đổi lại sau khi test xong!

---

## 📋 BƯỚC 4: KIỂM TRA BACKEND API

### Test API endpoint trực tiếp với Thunder Client/Postman:

#### 1. Login để lấy token
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

Response sẽ trả về:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc..."
  }
}
```

Copy `accessToken` từ response.

#### 2. Test getAllUsers endpoint
```
GET http://localhost:3000/api/users/admin/all?page=1&limit=10
Authorization: Bearer <paste-token-here>
```

Hoặc nếu dùng cookie:
```
GET http://localhost:3000/api/users/admin/all?page=1&limit=10
Cookie: jwt=<paste-token-here>
```

Nếu API trả về data → Backend hoạt động tốt, vấn đề ở frontend.

---

## 📋 BƯỚC 5: KIỂM TRA AXIOS CONFIGURATION

### Verify `withCredentials` đã được bật:
File: `frontend/src/lib/axios.ts`

```typescript
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // ← Phải có dòng này
});
```

### Verify request interceptor:
```typescript
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);
```

---

## 📋 BƯỚC 6: KIỂM TRA CORS CONFIGURATION (Backend)

File: `backend/server.ts`

```typescript
server.register(cors, {
    origin: true, // Hoặc 'http://localhost:5173'
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
});
```

---

## 🐛 DEBUGGING TIPS

### 1. Check Network Tab
1. Mở DevTools → Tab **Network**
2. Thực hiện request (ví dụ: vào `/admin/users`)
3. Click vào request `all?page=1&limit=10`
4. Kiểm tra:
   - **Request Headers** → Phải có `Authorization: Bearer ...` hoặc `Cookie: jwt=...`
   - **Response** → Nếu 401, xem message lỗi cụ thể

### 2. Check Console Errors
Mở Console và xem có error nào liên quan đến:
- CORS
- Network
- Authentication

### 3. Clear Cache & Cookies
Nếu vẫn không hoạt động:
1. Mở DevTools
2. Right-click vào nút Refresh
3. Chọn **"Empty Cache and Hard Reload"**
4. Hoặc xóa localStorage:
```javascript
localStorage.clear();
```
5. Đăng nhập lại

---

## ✅ CHECKLIST HOÀN CHỈNH

- [ ] Đã đăng nhập thành công
- [ ] LocalStorage có `user` và `accessToken`
- [ ] User có `role: "admin"` (nếu truy cập admin routes)
- [ ] AuthDebug hiển thị "✅ Authenticated"
- [ ] Backend API hoạt động (test với Thunder Client)
- [ ] `withCredentials: true` trong axios config
- [ ] CORS đã được cấu hình đúng
- [ ] Request headers có Authorization token

---

## 🆘 VẪN KHÔNG HOẠT ĐỘNG?

### Thử các bước sau:

1. **Restart cả Frontend và Backend**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

2. **Clear tất cả cache**
```javascript
// Trong Console
localStorage.clear();
sessionStorage.clear();
```

3. **Tạo tài khoản mới và test lại**

4. **Check backend logs**
Xem terminal backend có error gì không

5. **Verify database**
Dùng Prisma Studio để xem user trong database:
```bash
cd backend
npx prisma studio
```

---

## 📞 DEBUG COMMANDS

### Frontend Console Commands:
```javascript
// Check authentication
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('Token:', localStorage.getItem('accessToken'));

// Test API call
fetch('http://localhost:3000/api/users/admin/all?page=1&limit=10', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
    }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Backend Database Query:
```sql
-- Check users table
SELECT id, email, role, is_active FROM users;

-- Update user to admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

Good luck! 🎉
