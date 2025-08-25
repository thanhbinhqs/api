import { Injectable } from '@nestjs/common';
import { NotificationEventService } from '../../common/services/notification-event.service';
import { NOTIFICATION_EVENTS } from '../../common/constants/notification-events';

/**
 * Ví dụ về cách tích hợp notification vào các service khác
 * Example of how to integrate notifications into other services
 */
@Injectable()
export class ExampleNotificationUsage {
  constructor(
    private readonly notificationEventService: NotificationEventService
  ) {}

  // Ví dụ 1: Gửi thông báo khi tạo part mới (sử dụng generic event)
  async onPartCreated(part: any, createdBy: string) {
    // Sử dụng system settings event cho part created
    this.notificationEventService.emitSystemSettingsUpdated({
      settingKey: 'part_created',
      partId: part.id,
      partName: part.name,
      message: `Part mới được tạo: ${part.name}`,
      createdBy,
      type: NOTIFICATION_EVENTS.SYSTEM_SETTINGS_UPDATED,
      timestamp: new Date()
    });
  }

  // Ví dụ 2: Gửi thông báo khi stock part thấp
  async onPartStockLow(part: any, currentStock: number, minStock: number) {
    this.notificationEventService.emitPartStockLow({
      partId: part.id,
      partName: part.name,
      currentStock,
      minStock,
      message: `Cảnh báo: Tồn kho part ${part.name} thấp (${currentStock}/${minStock})`,
      type: NOTIFICATION_EVENTS.PART_STOCK_LOW,
      priority: 'high',
      timestamp: new Date()
    });
  }

  // Ví dụ 3: Gửi thông báo khi jig được tạo
  async onJigCreated(jig: any, createdBy: string) {
    this.notificationEventService.emitJigCreated({
      jigId: jig.id,
      jigName: jig.name,
      message: `Jig mới được tạo: ${jig.name}`,
      createdBy,
      zone: jig.zone?.name,
      line: jig.line?.name,
      type: NOTIFICATION_EVENTS.JIG_CREATED,
      timestamp: new Date()
    });
  }

  // Ví dụ 4: Gửi thông báo bảo trì jig
  async onJigMaintenanceDue(jig: any, maintenanceType: 'preventive' | 'corrective') {
    this.notificationEventService.emitJigMaintenanceDue({
      jigId: jig.id,
      jigName: jig.name,
      maintenanceType,
      message: `Jig ${jig.name} cần bảo trì ${maintenanceType === 'preventive' ? 'định kỳ' : 'sửa chữa'}`,
      scheduledDate: jig.nextMaintenanceDate,
      type: NOTIFICATION_EVENTS.JIG_MAINTENANCE_DUE,
      priority: maintenanceType === 'corrective' ? 'high' : 'medium',
      timestamp: new Date()
    });
  }

  // Ví dụ 5: Gửi thông báo thay đổi role user
  async onUserRoleChanged(user: any, oldRole: string, newRole: string, changedBy: string) {
    this.notificationEventService.emitUserRoleChanged({
      userId: user.id,
      username: user.username,
      oldRole,
      newRole,
      changedBy,
      message: `Role của ${user.username} đã được thay đổi từ ${oldRole} thành ${newRole}`,
      type: NOTIFICATION_EVENTS.USER_ROLE_CHANGED,
      timestamp: new Date()
    });
  }

  // Ví dụ 6: Gửi thông báo cập nhật system settings
  async onSystemSettingsUpdated(settingKey: string, oldValue: any, newValue: any, updatedBy: string) {
    this.notificationEventService.emitSystemSettingsUpdated({
      settingKey,
      oldValue,
      newValue,
      updatedBy,
      message: `Cài đặt hệ thống "${settingKey}" đã được cập nhật`,
      type: NOTIFICATION_EVENTS.SYSTEM_SETTINGS_UPDATED,
      timestamp: new Date()
    });
  }

  // Ví dụ 7: Gửi thông báo bảo trì hệ thống
  async onSystemMaintenance(startTime: Date, endTime: Date, reason: string) {
    this.notificationEventService.emitSystemMaintenance({
      startTime,
      endTime,
      reason,
      message: `Hệ thống sẽ bảo trì từ ${startTime.toLocaleString()} đến ${endTime.toLocaleString()}`,
      type: NOTIFICATION_EVENTS.SYSTEM_MAINTENANCE,
      priority: 'high',
      timestamp: new Date()
    });
  }
}

/**
 * Cách sử dụng trong Service thực tế:
 * 
 * 1. Import NotificationEventService trong constructor
 * 2. Gọi appropriate emit method sau khi business logic hoàn thành
 * 3. Include đầy đủ thông tin trong notification data
 * 
 * Example in PartService:
 * 
 * async create(createPartDto: CreatePartDto): Promise<Part> {
 *   const part = await this.partRepository.save(createPartDto);
 *   
 *   // Gửi thông báo part mới được tạo
 *   this.notificationEventService.emitPartCreated({
 *     partId: part.id,
 *     partName: part.name,
 *     message: `Part mới được tạo: ${part.name}`,
 *     createdBy: 'current-user',
 *     type: NOTIFICATION_EVENTS.PART_CREATED,
 *     timestamp: new Date()
 *   });
 *   
 *   return part;
 * }
 * 
 * async checkStockLevels(): Promise<void> {
 *   const lowStockParts = await this.findLowStockParts();
 *   
 *   for (const part of lowStockParts) {
 *     this.notificationEventService.emitPartStockLow({
 *       partId: part.id,
 *       partName: part.name,
 *       currentStock: part.currentStock,
 *       minStock: part.minStock,
 *       message: `Cảnh báo: Tồn kho part ${part.name} thấp`,
 *       type: NOTIFICATION_EVENTS.PART_STOCK_LOW,
 *       priority: 'high',
 *       timestamp: new Date()
 *     });
 *   }
 * }
 */
