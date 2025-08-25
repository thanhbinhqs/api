# Hệ thống Thông báo - Notification System

## Tổng quan

Hệ thống thông báo được tích hợp vào dự án để gửi thông báo real-time đến người dùng và nhóm người dùng khi có các sự kiện quan trọng xảy ra trong hệ thống.

## Kiến trúc

Hệ thống sử dụng kiến trúc event-driven với các thành phần chính:

1. **NotificationEventService**: Phát ra các events
2. **NotificationListener**: Lắng nghe events và gửi thông báo
3. **NotificationService**: Xử lý việc gửi thông báo
4. **NotificationGateway**: WebSocket gateway để gửi real-time

## Cấu trúc Files

```
src/
├── notification/
│   ├── notification.service.ts
│   ├── notification.gateway.ts
│   ├── notification.module.ts
│   ├── notification-integration.service.ts
│   └── notification.listener.ts
├── common/
│   ├── constants/
│   │   └── notification-events.ts
│   └── services/
│       └── notification-event.service.ts
```

## Các loại Events được hỗ trợ

### Task Events
- `TASK_CREATED`: Task mới được tạo
- `TASK_UPDATED`: Task được cập nhật
- `TASK_ASSIGNED`: Task được assign cho user
- `TASK_COMPLETED`: Task hoàn thành
- `TASK_OVERDUE`: Task quá hạn
- `TASK_DUE_SOON`: Task sắp đến hạn
- `TASK_STATUS_CHANGED`: Trạng thái task thay đổi

### User Events
- `USER_CREATED`: User mới được tạo
- `USER_ROLE_CHANGED`: Role của user thay đổi

### Jig Events
- `JIG_CREATED`: Jig mới được tạo
- `JIG_MAINTENANCE_DUE`: Jig cần bảo trì

### Part Events
- `PART_STOCK_LOW`: Tồn kho part thấp

### System Events
- `SYSTEM_SETTINGS_UPDATED`: Cài đặt hệ thống được cập nhật
- `SYSTEM_MAINTENANCE`: Bảo trì hệ thống

## Cách sử dụng

### 1. Inject NotificationEventService vào Service

```typescript
import { NotificationEventService } from '../common/services/notification-event.service';

@Injectable()
export class YourService {
  constructor(
    private readonly notificationEventService: NotificationEventService
  ) {}

  async createSomething() {
    // Your business logic...
    
    // Emit notification event
    this.notificationEventService.emitTaskCreated({
      task: createdTask,
      message: `Task mới được tạo: ${createdTask.title}`,
      taskId: createdTask.id,
      title: createdTask.title,
      type: NOTIFICATION_EVENTS.TASK_CREATED,
      timestamp: new Date()
    });
  }
}
```

### 2. Thêm NotificationEventService vào Module

```typescript
import { NotificationEventService } from '../common/services/notification-event.service';

@Module({
  // ...
  providers: [YourService, NotificationEventService],
  // ...
})
export class YourModule {}
```

## Ví dụ Implementation

### 1. Task Service (Đã được tích hợp)

```typescript
// Gửi thông báo khi tạo task
this.notificationEventService.emitTaskCreated({
  task: savedTask,
  message: `Task mới được tạo: ${savedTask.title}`,
  taskId: savedTask.id,
  title: savedTask.title,
  priority: savedTask.priority,
  createdBy: createdByUser.username,
  type: NOTIFICATION_EVENTS.TASK_CREATED,
  timestamp: new Date()
});
```

### 2. User Service (Ví dụ)

```typescript
// Gửi thông báo khi tạo user
this.notificationEventService.emitUserCreated({
  userId: user.id,
  username: user.username,
  message: `User mới được tạo: ${user.username}`,
  createdBy: currentUser.username,
  type: NOTIFICATION_EVENTS.USER_CREATED,
  timestamp: new Date()
});
```

### 3. Jig Service (Ví dụ)

```typescript
// Gửi thông báo khi jig cần bảo trì
this.notificationEventService.emitJigMaintenanceDue({
  jigId: jig.id,
  jigName: jig.name,
  message: `Jig ${jig.name} cần bảo trì`,
  maintenanceType: 'Định kỳ',
  type: NOTIFICATION_EVENTS.JIG_MAINTENANCE_DUE,
  timestamp: new Date()
});
```

## Client-side Integration

### WebSocket Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Lắng nghe các events
socket.on('task_created', (data) => {
  console.log('Task mới:', data);
  // Hiển thị notification
});

socket.on('task_overdue', (data) => {
  console.log('Task quá hạn:', data);
  // Hiển thị cảnh báo
});
```

## Cơ chế gửi thông báo

### 1. Gửi đến User cụ thể
```typescript
await this.notificationService.sendToUser(userId, event, data);
```

### 2. Gửi đến Role
```typescript
await this.notificationService.sendToRole('admin', event, data);
```

### 3. Gửi đến Permission
```typescript
await this.notificationService.sendToPermission(Permission.TASK_MANAGE_ALL, event, data);
```

### 4. Gửi đến tất cả Users
```typescript
await this.notificationService.sendToAll(event, data);
```

## Automated Notifications

### Cron Jobs đã được tích hợp:

1. **Task Overdue Check**: Chạy mỗi ngày lúc 6h sáng
   - Tìm các task quá hạn
   - Cập nhật status thành OVERDUE
   - Gửi thông báo đến assigned users/roles

2. **Task Due Soon**: Chạy mỗi ngày lúc 9h sáng
   - Tìm các task sắp đến hạn (trong 24h)
   - Gửi thông báo nhắc nhở

## Configuration

### Environment Variables
```
REDIS_URL=redis://localhost:6379  # For caching user connections
JWT_SECRET=your-secret            # For WebSocket authentication
```

## Best Practices

1. **Event Data Structure**: Luôn include các field cơ bản:
   ```typescript
   {
     message: string,
     type: NotificationEvent,
     timestamp: Date,
     // ... other relevant data
   }
   ```

2. **Error Handling**: NotificationListener đã có error handling, nhưng nên log errors trong service

3. **Performance**: Sử dụng Redis cho caching connections và async processing

4. **Security**: WebSocket authentication qua JWT token

## Troubleshooting

### 1. Notifications không được gửi
- Kiểm tra NotificationEventService đã được inject đúng
- Kiểm tra NotificationListener đã được register trong module
- Kiểm tra WebSocket connection

### 2. User không nhận được notifications
- Kiểm tra user đã kết nối WebSocket
- Kiểm tra JWT token hợp lệ
- Kiểm tra user có đúng role/permission

### 3. Performance issues
- Kiểm tra Redis connection
- Optimize số lượng listeners
- Batch notifications khi có thể
