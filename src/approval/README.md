# Approval System Module

## Tổng quan

Module này cung cấp một hệ thống phê duyệt toàn diện cho toàn bộ dự án, cho phép tạo và quản lý các quy trình phê duyệt linh hoạt.

## Các thành phần chính

### 1. Entities

- **ApprovalWorkflow**: Định nghĩa quy trình phê duyệt
- **ApprovalStep**: Các bước trong quy trình
- **ApprovalRequest**: Yêu cầu phê duyệt
- **ApprovalStepInstance**: Instance của từng bước trong một request
- **ApprovalAction**: Hành động phê duyệt (approve/reject/return)
- **ApprovalComment**: Bình luận trong request
- **ApprovalDelegation**: Ủy quyền phê duyệt

### 2. Enums

- **ApprovalStatus**: PENDING, APPROVED, REJECTED, CANCELLED, RETURNED, WITHDRAWN
- **ApprovalType**: SEQUENTIAL, PARALLEL, UNANIMOUS, MAJORITY, ANY_ONE
- **ApprovalStepStatus**: PENDING, APPROVED, REJECTED, SKIPPED, WAITING
- **ApprovalPriority**: LOW, NORMAL, HIGH, URGENT, CRITICAL

### 3. Services

- **ApprovalWorkflowService**: Quản lý quy trình
- **ApprovalStepService**: Quản lý các bước
- **ApprovalRequestService**: Xử lý yêu cầu phê duyệt
- **ApprovalCommentService**: Quản lý bình luận
- **ApprovalDelegationService**: Quản lý ủy quyền

### 4. Controllers

- **ApprovalWorkflowController**: API cho quy trình
- **ApprovalRequestController**: API cho yêu cầu
- **ApprovalDelegationController**: API cho ủy quyền

## Cách sử dụng

### 1. Tạo quy trình phê duyệt

```typescript
// Tạo workflow
const workflow = await approvalWorkflowService.create({
  code: 'JIG_APPROVAL',
  name: 'Quy trình phê duyệt Jig',
  description: 'Phê duyệt thiết kế và sản xuất jig',
  type: ApprovalType.SEQUENTIAL
});

// Thêm các bước
await approvalStepService.create({
  workflowId: workflow.id,
  name: 'Phê duyệt trưởng phòng',
  stepOrder: 1,
  approvers: ['manager-id'],
  requiredApprovals: 1
});

await approvalStepService.create({
  workflowId: workflow.id,
  name: 'Phê duyệt giám đốc',
  stepOrder: 2,
  approvers: ['director-id'],
  requiredApprovals: 1
});
```

### 2. Tạo yêu cầu phê duyệt

```typescript
const request = await approvalRequestService.create({
  workflowCode: 'JIG_APPROVAL',
  title: 'Phê duyệt Jig ABC123',
  description: 'Yêu cầu phê duyệt thiết kế jig cho sản phẩm ABC123',
  entityType: 'jig',
  entityId: 'jig-123',
  priority: ApprovalPriority.HIGH
}, requesterId);
```

### 3. Thực hiện phê duyệt

```typescript
await approvalRequestService.takeAction(requestId, {
  action: 'approved',
  comments: 'Đã kiểm tra và phê duyệt'
}, approverId, approverName);
```

### 4. Ủy quyền phê duyệt

```typescript
await approvalDelegationService.create({
  toUserId: 'deputy-id',
  workflowCode: 'JIG_APPROVAL',
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
  reason: 'Đi công tác'
}, fromUserId);
```

## API Endpoints

### Workflows
- `GET /approval/workflows` - Danh sách quy trình
- `POST /approval/workflows` - Tạo quy trình mới
- `GET /approval/workflows/:id` - Chi tiết quy trình
- `PUT /approval/workflows/:id` - Cập nhật quy trình
- `DELETE /approval/workflows/:id` - Xóa quy trình

### Requests
- `GET /approval/requests` - Danh sách yêu cầu
- `POST /approval/requests` - Tạo yêu cầu mới
- `GET /approval/requests/my-requests` - Yêu cầu của tôi
- `GET /approval/requests/pending` - Yêu cầu cần phê duyệt
- `POST /approval/requests/:id/action` - Thực hiện hành động
- `POST /approval/requests/:id/withdraw` - Rút lại yêu cầu

### Delegations
- `GET /approval/delegations` - Danh sách ủy quyền
- `POST /approval/delegations` - Tạo ủy quyền mới
- `PUT /approval/delegations/:id` - Cập nhật ủy quyền
- `DELETE /approval/delegations/:id` - Xóa ủy quyền

## Events

Module này phát ra các events sau:

- `approval.request.created` - Khi tạo yêu cầu mới
- `approval.step.started` - Khi bắt đầu một bước
- `approval.action.taken` - Khi có hành động phê duyệt
- `approval.request.completed` - Khi hoàn thành yêu cầu
- `approval.request.withdrawn` - Khi rút lại yêu cầu

## Tích hợp với các module khác

Để sử dụng trong module khác:

```typescript
// Import service
constructor(
  private readonly approvalRequestService: ApprovalRequestService,
) {}

// Tạo yêu cầu phê duyệt cho jig
async createJigApprovalRequest(jigId: string, userId: string) {
  return await this.approvalRequestService.create({
    workflowCode: 'JIG_APPROVAL',
    title: `Phê duyệt Jig ${jigId}`,
    entityType: 'jig',
    entityId: jigId,
    priority: ApprovalPriority.NORMAL
  }, userId);
}
```

## Cấu hình Database

Module sử dụng PostgreSQL và các bảng sau sẽ được tạo tự động:

- `approval_workflows`
- `approval_steps`
- `approval_requests`
- `approval_step_instances`
- `approval_actions`
- `approval_comments`
- `approval_delegations`

## Lưu ý

1. Module yêu cầu EventEmitter2 để hoạt động
2. Sử dụng PostgreSQL JSONB để lưu dữ liệu linh hoạt
3. Hỗ trợ soft delete cho tất cả entities
4. Tích hợp sẵn với hệ thống audit log
5. Hỗ trợ đa ngôn ngữ và timezone
