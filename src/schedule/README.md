# Schedule Module

Module quản lý các cron job và scheduled tasks trong hệ thống.

## Tổng quan

Schedule Module tập trung hóa việc quản lý tất cả các cron job và scheduled tasks, giúp dễ dàng theo dõi và bảo trì. Module này được tách riêng từ các service khác để đảm bảo nguyên tắc separation of concerns.

## Cấu trúc

```
src/schedule/
├── schedule.module.ts          # Module chính
├── services/
│   └── task-schedule.service.ts # Service quản lý cron jobs cho tasks
├── index.ts                    # Export module
└── README.md                   # Tài liệu
```

## Các Cron Jobs

### TaskScheduleService

#### 1. `createMaintenanceTasks()` 
- **Schedule**: Chạy hàng ngày lúc 00:00 (`CronExpression.EVERY_DAY_AT_MIDNIGHT`)
- **Mục đích**: Tự động tạo các task bảo trì cho jigs và jig details
- **Chức năng**:
  - Kiểm tra các jigs cần bảo trì
  - Tạo task maintenance cho jigs chưa có task pending
  - Tạo task maintenance cho jig details đã đến thời gian bảo trì

#### 2. `updateOverdueTasks()`
- **Schedule**: Chạy mỗi giờ (`CronExpression.EVERY_HOUR`)
- **Mục đích**: Cập nhật status các task quá hạn
- **Chức năng**:
  - Tìm các task có `scheduledEndDate` đã qua và status vẫn là PENDING hoặc IN_PROGRESS
  - Cập nhật status thành OVERDUE
  - Gửi thông báo cho các task quá hạn

#### 3. `notifyUpcomingTasks()`
- **Schedule**: Chạy hàng ngày lúc 9:00 sáng (`'0 9 * * *'`)
- **Mục đích**: Thông báo về các task sắp đến hạn
- **Chức năng**:
  - Tìm các task sẽ đến hạn trong vòng 24 giờ tới
  - Gửi thông báo reminder cho các assignee

## Cách sử dụng

### 1. Import Module

```typescript
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [
    // ... other modules
    ScheduleModule,
  ],
})
export class AppModule {}
```

### 2. Thêm cron job mới

Để thêm cron job mới, tạo service trong thư mục `services/` và sử dụng decorator `@Cron`:

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MyScheduleService {
  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron() {
    console.log('Called every 30 seconds');
  }
}
```

## Dependencies

- `@nestjs/schedule`: Core scheduling module của NestJS
- `@nestjs/typeorm`: Để tương tác với database
- `NotificationEventService`: Để gửi thông báo

## Logging

Tất cả các cron job đều có logging để theo dõi:
- Thời gian bắt đầu và kết thúc
- Số lượng record được xử lý
- Lỗi nếu có

## Monitoring

Để monitor các cron job:
1. Kiểm tra logs trong console/file logs
2. Theo dõi các notification được gửi
3. Kiểm tra database để verify kết quả

## Best Practices

1. **Error Handling**: Luôn wrap cron job logic trong try-catch
2. **Logging**: Log đầy đủ thông tin để debug
3. **Performance**: Avoid long-running operations, chia nhỏ batch nếu cần
4. **Testing**: Tạo unit test cho các cron job logic (không test scheduler)

## Troubleshooting

### Cron job không chạy
- Kiểm tra ScheduleModule đã được import trong AppModule chưa
- Verify cron expression đúng format
- Kiểm tra logs để xem có lỗi gì không

### Performance issues
- Monitor thời gian thực thi của các job
- Optimize database queries
- Consider pagination cho large datasets

## Future Enhancements

- [ ] Dashboard để monitor cron jobs
- [ ] Dynamic scheduling từ database
- [ ] Job queue cho heavy operations
- [ ] Distributed scheduling cho multiple instances
