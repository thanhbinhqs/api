# Hệ thống Order Jig từ xa

## Tổng quan

Hệ thống cho phép người dùng đặt hàng jig từ xa thông qua một quy trình hoàn chỉnh bao gồm: order → phê duyệt → chuẩn bị → thông báo → lấy jig → tích hợp xuất nhập.

## Quy trình Order Jig

### 1. Tạo Order (DRAFT)
- Người dùng tạo đơn hàng với thông tin:
  - Tiêu đề và mô tả
  - Danh sách jig details cần order
  - Số lượng mỗi jig
  - Mức độ ưu tiên (LOW, NORMAL, HIGH, URGENT)
  - Ngày cần có
  - Vị trí giao hàng (Location hoặc Line)
- Trạng thái: `DRAFT`

### 2. Submit Order (SUBMITTED)
- Người tạo submit đơn hàng để chờ phê duyệt
- Hệ thống tự động tạo approval request
- Gửi notification đến người phê duyệt
- Trạng thái: `SUBMITTED`

### 3. Phê duyệt (APPROVED/REJECTED)
- Người có quyền phê duyệt xem xét đơn hàng
- Có thể phê duyệt hoặc từ chối với lý do
- Gửi notification về kết quả cho người tạo
- Trạng thái: `APPROVED` hoặc `REJECTED`

### 4. Chuẩn bị (PREPARING → READY)
- Warehouse team chuẩn bị jig theo đơn hàng
- Cập nhật số lượng thực tế có thể chuẩn bị
- Tạo inout history để track việc xuất jig
- Khi tất cả jig đã chuẩn bị xong → `READY`

### 5. Thông báo (NOTIFIED)
- Warehouse team thông báo đơn hàng đã sẵn sàng
- Gửi notification đến người đặt hàng
- Thông tin vị trí lấy jig
- Trạng thái: `NOTIFIED`

### 6. Lấy jig (PICKED_UP → COMPLETED)
- Người nhận đến lấy jig
- Xác nhận người nhận thực tế
- Cập nhật vị trí mới của jig details
- Tạo inout history cho việc nhận jig
- Trạng thái: `PICKED_UP` → `COMPLETED`

## Các Entity chính

### JigOrder
- `orderCode`: Mã đơn hàng tự động (JO20241226001)
- `title`: Tiêu đề đơn hàng
- `status`: Trạng thái hiện tại
- `priority`: Mức độ ưu tiên
- `requester`: Người yêu cầu
- `approver`: Người phê duyệt
- `preparer`: Người chuẩn bị
- `receiver`: Người nhận
- `deliveryLocation/Line`: Vị trí giao hàng

### JigOrderDetail
- `jigDetail`: Jig detail được order
- `quantity`: Số lượng yêu cầu
- `actualQuantity`: Số lượng thực tế chuẩn bị
- `isPrepared`: Đã chuẩn bị chưa
- `notes`: Ghi chú

## API Endpoints

### Quản lý Order
- `POST /jig-orders` - Tạo đơn hàng mới
- `GET /jig-orders` - Danh sách đơn hàng
- `GET /jig-orders/my-orders` - Đơn hàng của tôi
- `GET /jig-orders/:id` - Chi tiết đơn hàng
- `PATCH /jig-orders/:id` - Cập nhật đơn hàng
- `DELETE /jig-orders/:id` - Xóa đơn hàng

### Quy trình
- `POST /jig-orders/:id/submit` - Submit để chờ phê duyệt
- `POST /jig-orders/:id/approve` - Phê duyệt đơn hàng
- `POST /jig-orders/:id/reject` - Từ chối đơn hàng
- `POST /jig-orders/:id/prepare` - Chuẩn bị đơn hàng
- `POST /jig-orders/:id/notify` - Thông báo sẵn sàng
- `POST /jig-orders/:id/pickup` - Lấy jig
- `POST /jig-orders/:id/cancel` - Hủy đơn hàng

### Báo cáo
- `GET /jig-orders/pending-approvals` - Đơn hàng chờ phê duyệt
- `GET /jig-orders/pending-preparations` - Đơn hàng chờ chuẩn bị
- `GET /jig-orders/statistics` - Thống kê đơn hàng

## Permissions

- `JIG_ORDER_CREATE` - Tạo đơn hàng
- `JIG_ORDER_READ` - Xem đơn hàng
- `JIG_ORDER_UPDATE` - Cập nhật đơn hàng
- `JIG_ORDER_DELETE` - Xóa đơn hàng
- `JIG_ORDER_APPROVE` - Phê duyệt đơn hàng
- `JIG_ORDER_PREPARE` - Chuẩn bị đơn hàng
- `JIG_ORDER_PICKUP` - Lấy jig

## Tích hợp với các module khác

### Approval System
- Tự động tạo approval request khi submit
- Workflow: JIG_ORDER_APPROVAL
- Các bước: Kiểm tra yêu cầu → Phê duyệt manager

### Notification System
- Thông báo khi tạo đơn hàng mới
- Thông báo khi submit chờ phê duyệt
- Thông báo kết quả phê duyệt
- Thông báo khi đơn hàng sẵn sàng
- Thông báo khi hoàn thành

### InOut History
- Track việc xuất jig khi chuẩn bị
- Track việc nhập jig khi lấy hàng
- Lịch sử di chuyển jig detail

### Location/Line Management
- Cập nhật vị trí mới của jig khi lấy hàng
- Support giao hàng đến Location hoặc Line

## Workflow Integration

Hệ thống tích hợp với approval workflow để tự động xử lý phê duyệt:

```typescript
// Tự động approve order khi approval request được approve
@OnEvent('approval.request.approved')
async handleApprovalApproved(payload) {
  if (payload.entityType === 'jig-order') {
    await this.jigOrderService.approve(payload.entityId, {}, payload.approverId);
  }
}
```

## Ví dụ sử dụng

### 1. Tạo đơn hàng mới
```typescript
const order = await jigOrderService.create({
  title: 'Order jig cho dự án ABC',
  description: 'Cần jig để sản xuất batch mới',
  priority: JigOrderPriority.HIGH,
  requiredDate: '2024-12-30',
  deliveryLineId: 'line-123',
  orderDetails: [
    {
      jigDetailId: 'jig-detail-1',
      quantity: 2,
      notes: 'Cần kiểm tra trước khi giao'
    }
  ]
}, userId);
```

### 2. Submit để chờ phê duyệt
```typescript
await jigOrderService.submit(orderId, userId);
```

### 3. Phê duyệt
```typescript
await jigOrderService.approve(orderId, {
  notes: 'Đã kiểm tra và phê duyệt'
}, approverId);
```

### 4. Chuẩn bị
```typescript
await jigOrderService.prepare(orderId, {
  preparationNotes: 'Đã chuẩn bị xong',
  preparedDetails: [
    {
      orderDetailId: 'detail-1',
      actualQuantity: 2,
      notes: 'Đủ số lượng'
    }
  ]
}, preparerId);
```

### 5. Lấy jig
```typescript
await jigOrderService.pickup(orderId, {
  deliveryNotes: 'Đã giao thành công',
  actualReceiverId: receiverId
}, pickupUserId);
```

## Monitoring và Báo cáo

### Dashboard thống kê
- Số đơn hàng theo trạng thái
- Số đơn hàng theo mức độ ưu tiên
- Thời gian xử lý trung bình
- Top jig được order nhiều nhất

### Alert và Notification
- Đơn hàng quá hạn chưa phê duyệt
- Đơn hàng urgent cần xử lý gấp
- Jig không có sẵn khi chuẩn bị

## Security

- Chỉ người tạo order mới có thể update/cancel (ở trạng thái DRAFT)
- Phân quyền rõ ràng cho từng bước trong quy trình
- Audit log cho tất cả các thao tác quan trọng
- Validation đầy đủ cho input data
