# External System Authentication

Hệ thống quản lý thông tin đăng nhập các hệ thống bên ngoài với khả năng mã hóa và theo dõi trạng thái.

## Tính năng

- **Mã hóa dữ liệu**: Tất cả thông tin đăng nhập được mã hóa AES-256-CBC trước khi lưu vào database
- **Quản lý trạng thái**: Theo dõi trạng thái hoạt động và thời gian hết hạn
- **Thông báo tự động**: Tự động tạo thông báo khi credentials sắp hết hạn hoặc có vấn đề
- **Đa hệ thống**: Hỗ trợ lưu thông tin đăng nhập cho nhiều hệ thống khác nhau

## Cấu trúc dữ liệu

### ExternalSystemCredentials
```typescript
{
  systemName: string;        // Tên hệ thống
  username?: string;         // Tên đăng nhập
  password?: string;         // Mật khẩu
  token?: string;           // Token truy cập
  refreshToken?: string;    // Refresh token
  apiKey?: string;         // API key
  baseUrl?: string;        // URL gốc của hệ thống
  expiresAt?: Date;        // Thời gian hết hạn
  lastUpdated: Date;       // Lần cập nhật cuối
  isActive: boolean;       // Trạng thái hoạt động
  metadata?: Record<string, any>; // Thông tin bổ sung
}
```

### ExternalSystemAuthStatus
- `ACTIVE`: Hoạt động bình thường
- `EXPIRED`: Đã hết hạn
- `DISABLED`: Bị vô hiệu hóa
- `NEEDS_REFRESH`: Cần làm mới (sắp hết hạn trong 7 ngày)
- `ERROR`: Có lỗi xảy ra

## API Endpoints

### 1. Tạo/Cập nhật thông tin đăng nhập
```http
POST /external-system-auth
Content-Type: application/json
Authorization: Bearer <token>

{
  "systemName": "erp-system",
  "username": "user123",
  "password": "password123",
  "baseUrl": "https://erp.company.com",
  "expiresAt": "2024-12-31T23:59:59Z",
  "metadata": {
    "department": "IT",
    "role": "admin"
  }
}
```

### 2. Lấy thông tin đăng nhập của một hệ thống
```http
GET /external-system-auth/{systemName}
Authorization: Bearer <token>
```

### 3. Lấy tất cả thông tin đăng nhập
```http
GET /external-system-auth
Authorization: Bearer <token>
```

### 4. Cập nhật trạng thái hoạt động
```http
PUT /external-system-auth/{systemName}/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "isActive": false
}
```

### 5. Xóa thông tin đăng nhập
```http
DELETE /external-system-auth/{systemName}
Authorization: Bearer <token>
```

### 6. Lấy thông báo
```http
GET /external-system-auth/notifications/all
Authorization: Bearer <token>
```

### 7. Xóa thông báo
```http
DELETE /external-system-auth/notifications/clear
Content-Type: application/json
Authorization: Bearer <token>

{
  "systemName": "erp-system" // Optional, nếu không có sẽ xóa tất cả
}
```

## Cách sử dụng trong code

### Inject service
```typescript
import { ExternalSystemAuthService } from './external-system-auth.service';

constructor(
  private externalSystemAuthService: ExternalSystemAuthService,
) {}
```

### Lưu thông tin đăng nhập
```typescript
await this.externalSystemAuthService.setExternalSystemAuth(
  userId,
  'erp-system',
  {
    username: 'user123',
    password: 'password123',
    baseUrl: 'https://erp.company.com',
    expiresAt: new Date('2024-12-31'),
  }
);
```

### Lấy thông tin đăng nhập
```typescript
const credentials = await this.externalSystemAuthService.getExternalSystemAuth(
  userId,
  'erp-system'
);

if (credentials) {
  // Sử dụng credentials để đăng nhập hệ thống bên ngoài
  const response = await axios.post(`${credentials.baseUrl}/login`, {
    username: credentials.username,
    password: credentials.password,
  });
}
```

### Kiểm tra thông báo
```typescript
const notifications = await this.externalSystemAuthService.getAuthNotifications(userId);
notifications.forEach(notification => {
  if (notification.status === ExternalSystemAuthStatus.EXPIRED) {
    // Xử lý credentials đã hết hạn
    console.log(`${notification.systemName}: ${notification.message}`);
  }
});
```

## Bảo mật

1. **Mã hóa**: Tất cả credentials được mã hóa bằng AES-256-CBC
2. **Quyền truy cập**: Chỉ user có quyền `USER_UPDATE` mới có thể tạo/sửa, quyền `USER_DELETE` mới có thể xóa
3. **Validation**: Tất cả input đều được validate
4. **Audit log**: Tất cả thao tác đều được ghi log

## Migration

Chạy migration để thêm các cột mới:
```bash
npm run migration:run
```

Hoặc tạo migration mới:
```bash
npm run migration:generate -- --name=AddExternalSystemAuth
```

## Lưu ý

1. Đảm bảo đã cấu hình `ENCRYPTION_KEY` và `ENCRYPTION_IV` trong environment variables
2. Thông báo tự động được tạo khi credentials sắp hết hạn trong vòng 7 ngày
3. Tối đa 10 thông báo gần nhất được lưu trữ cho mỗi user
4. Dữ liệu được mã hóa tự động khi lưu và giải mã khi đọc từ database
