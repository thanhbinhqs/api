# Task Module

Module quản lý nhiệm vụ (task) trong hệ thống, hỗ trợ giao việc cho users/roles và tự động tạo task bảo trì cho jigs và jig details.

## Tính năng chính

### 1. Quản lý Task
- **Tạo task**: Tạo task thủ công với nhiều loại khác nhau
- **Cập nhật task**: Sửa đổi thông tin task, trạng thái
- **Xóa task**: Xóa task (chỉ admin)
- **Xem task**: Xem chi tiết task, danh sách task với filter

### 2. Phân công Task
- **Giao cho User**: Giao task cho một hoặc nhiều user cụ thể
- **Giao cho Role**: Giao task cho role/nhóm, tất cả user trong role sẽ thấy task
- **Tự nhận task**: User có thể tự nhận task được giao cho role của mình
- **Assign task**: Admin có thể giao task cho user khác

### 3. Loại Task
- **MANUAL**: Task thủ công do user tạo
- **MAINTENANCE**: Task bảo trì thiết bị
- **INSPECTION**: Task kiểm tra
- **REPAIR**: Task sửa chữa
- **CLEANING**: Task vệ sinh
- **CALIBRATION**: Task hiệu chuẩn

### 4. Mức độ ưu tiên
- **LOW**: Thấp
- **MEDIUM**: Trung bình
- **HIGH**: Cao
- **URGENT**: Khẩn cấp

### 5. Trạng thái Task
- **PENDING**: Chờ xử lý
- **IN_PROGRESS**: Đang thực hiện
- **COMPLETED**: Hoàn thành
- **CANCELLED**: Đã hủy
- **OVERDUE**: Quá hạn

### 6. Tự động tạo Task bảo trì
- **Jig Maintenance**: Tự động tạo task bảo trì cho jigs theo chu kỳ `maintenanceInterval`
- **Jig Detail Maintenance**: Tự động tạo task bảo trì cho jig details dựa trên `lastMaintenanceDate`
- **Recurring Tasks**: Tự động tạo task tiếp theo sau khi hoàn thành task định kỳ
- **Scheduled Jobs**: Chạy tự động mỗi ngày để tạo maintenance tasks và cập nhật overdue tasks

### 7. Tính năng nâng cao
- **Checklist**: Danh sách các mục cần kiểm tra khi thực hiện task
- **File attachments**: Đính kèm file vào task
- **Tags**: Gắn tag để phân loại task
- **Time tracking**: Theo dõi thời gian thực hiện vs ước tính
- **Recurring tasks**: Task lặp lại theo chu kỳ
- **Statistics**: Thống kê task theo user/role
- **Upcoming tasks**: Xem các task sắp tới hạn

## API Endpoints

### Task Management
```
GET    /tasks                    # Lấy danh sách tasks với filter
POST   /tasks                    # Tạo task mới
GET    /tasks/:id                # Lấy chi tiết task
PATCH  /tasks/:id                # Cập nhật task
DELETE /tasks/:id                # Xóa task
```

### Task Assignment & Execution
```
POST   /tasks/:id/assign         # Giao task cho user
POST   /tasks/:id/assign-to-me   # Tự nhận task
POST   /tasks/:id/complete       # Hoàn thành task
```

### Task Analytics
```
GET    /tasks/statistics         # Thống kê tasks
GET    /tasks/upcoming           # Tasks sắp tới hạn
GET    /tasks/my-tasks           # Tasks của user hiện tại
```

### Admin Functions
```
POST   /tasks/trigger-maintenance  # Trigger tạo maintenance tasks
POST   /tasks/update-overdue      # Cập nhật overdue tasks
```

## Filter Parameters

### TaskFilterDto
- `search`: Tìm kiếm theo title/description
- `type`: Lọc theo loại task
- `priority`: Lọc theo mức độ ưu tiên
- `status`: Lọc theo trạng thái
- `assigneeType`: Lọc theo kiểu phân công (USER/ROLE)
- `assignedUserId`: Lọc task được giao cho user
- `assignedRoleId`: Lọc task được giao cho role
- `executedBy`: Lọc task được thực hiện bởi user
- `createdBy`: Lọc task được tạo bởi user
- `relatedJigId`: Lọc task liên quan đến jig
- `relatedJigDetailId`: Lọc task liên quan đến jig detail
- `scheduledStartFrom/To`: Lọc theo thời gian bắt đầu dự kiến
- `scheduledEndFrom/To`: Lọc theo thời gian kết thúc dự kiến
- `isRecurring`: Lọc recurring tasks
- `isOverdue`: Lọc overdue tasks
- `tags`: Lọc theo tags
- `page`, `limit`: Phân trang
- `sortBy`, `sortOrder`: Sắp xếp

## Permissions

- `TASK_CREATE`: Tạo task
- `TASK_READ`: Xem task
- `TASK_UPDATE`: Cập nhật task
- `TASK_DELETE`: Xóa task
- `TASK_ASSIGN`: Giao task cho user khác
- `TASK_MANAGE_ALL`: Quản lý tất cả tasks (admin)

## Scheduled Jobs

### 1. Create Maintenance Tasks
- **Cron**: Mỗi ngày lúc 00:00
- **Chức năng**: Tạo maintenance tasks cho jigs và jig details cần bảo trì
- **Logic**: 
  - Kiểm tra jigs có `needMaintenance = true`
  - Tạo task nếu chưa có task maintenance pending
  - Tạo task cho jig details đã quá thời gian bảo trì

### 2. Update Overdue Tasks
- **Cron**: Mỗi giờ
- **Chức năng**: Cập nhật trạng thái tasks quá hạn
- **Logic**: Đổi status thành OVERDUE cho tasks có `scheduledEndDate` < hiện tại

## Cách sử dụng

### 1. Tạo task thủ công
```typescript
const createTaskDto = {
  title: "Kiểm tra máy A",
  description: "Kiểm tra hoạt động của máy A",
  type: TaskType.INSPECTION,
  priority: TaskPriority.HIGH,
  assigneeType: AssigneeType.ROLE,
  assignedRoleIds: ["role-technician-id"],
  scheduledStartDate: "2024-12-01T08:00:00Z",
  scheduledEndDate: "2024-12-01T10:00:00Z",
  estimatedDuration: 120,
  checklist: [
    { id: "1", title: "Kiểm tra nguồn điện", completed: false, required: true },
    { id: "2", title: "Kiểm tra cảm biến", completed: false, required: true }
  ]
};
```

### 2. Giao task cho user
```typescript
// Giao task cho user cụ thể
await taskService.assignTask(taskId, userId);

// User tự nhận task
await taskService.assignTask(taskId, currentUserId);
```

### 3. Hoàn thành task
```typescript
await taskService.completeTask(taskId, "Đã hoàn thành kiểm tra", checklist);
```

### 4. Tạo maintenance task tự động
Hệ thống sẽ tự động:
1. Quét tất cả jigs có `needMaintenance = true`
2. Tạo task bảo trì nếu đã đến thời gian (`maintenanceInterval`)
3. Tạo task cho jig details dựa trên `lastMaintenanceDate`
4. Tạo task tiếp theo cho recurring tasks khi hoàn thành

## Database Schema

### Task Entity
- Thông tin cơ bản: title, description, type, priority, status
- Phân công: assigneeType, assignedUsers, assignedRoles, executedBy
- Thời gian: scheduledStartDate, scheduledEndDate, actualStartDate, actualEndDate
- Liên quan: relatedJig, relatedJigDetail, parentTask
- Mở rộng: checklist, attachments, tags, isRecurring, recurringInterval

### Relationships
- **Task** M:N **User** (assignedUsers)
- **Task** M:N **Role** (assignedRoles)
- **Task** M:1 **User** (executedBy, taskCreatedBy)
- **Task** M:1 **Jig** (relatedJig)
- **Task** M:1 **JigDetail** (relatedJigDetail)
- **Task** M:1 **Task** (parentTask - cho recurring tasks)
