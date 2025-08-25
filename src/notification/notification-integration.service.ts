import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { NOTIFICATION_EVENTS, NotificationData } from '../common/constants/notification-events';
import { Permission } from '../common/enums/permission.enum';

@Injectable()
export class NotificationIntegrationService {
  private readonly logger = new Logger(NotificationIntegrationService.name);

  constructor(private readonly notificationService: NotificationService) {}

  // Gửi thông báo cho admin và managers
  async notifyAdminAndManagers(event: string, data: NotificationData): Promise<void> {
    try {
      await this.notificationService.sendToRole('admin', event, data);
      await this.notificationService.sendToRole('manager', event, data);
    } catch (error) {
      this.logger.error(`Error notifying admin and managers: ${error.message}`);
    }
  }

  // Gửi thông báo theo quyền hạn
  async notifyByPermission(permission: Permission, event: string, data: NotificationData): Promise<void> {
    try {
      await this.notificationService.sendToPermission(permission, event, data);
    } catch (error) {
      this.logger.error(`Error notifying by permission ${permission}: ${error.message}`);
    }
  }

  // Gửi thông báo hệ thống cho tất cả user
  async notifyAllUsers(event: string, data: NotificationData): Promise<void> {
    try {
      await this.notificationService.sendToAll(event, data);
    } catch (error) {
      this.logger.error(`Error notifying all users: ${error.message}`);
    }
  }

  // Gửi thông báo về jig maintenance
  async notifyJigMaintenance(jigId: string, jigName: string, maintenanceType: string): Promise<void> {
    const data: NotificationData = {
      message: `Jig ${jigName} cần ${maintenanceType}`,
      type: NOTIFICATION_EVENTS.JIG_MAINTENANCE_DUE,
      jigId,
      jigName,
      maintenanceType,
      timestamp: new Date()
    };

    await this.notifyByPermission(Permission.JIG_UPDATE, NOTIFICATION_EVENTS.JIG_MAINTENANCE_DUE, data);
  }

  // Gửi thông báo về part stock thấp
  async notifyLowStock(partId: string, partName: string, currentStock: number, minStock: number): Promise<void> {
    const data: NotificationData = {
      message: `Tồn kho part ${partName} thấp: ${currentStock}/${minStock}`,
      type: NOTIFICATION_EVENTS.PART_STOCK_LOW,
      partId,
      partName,
      currentStock,
      minStock,
      timestamp: new Date()
    };

    await this.notifyByPermission(Permission.PART_UPDATE, NOTIFICATION_EVENTS.PART_STOCK_LOW, data);
  }

  // Gửi thông báo về user mới
  async notifyUserCreated(userId: string, username: string, createdBy: string): Promise<void> {
    const data: NotificationData = {
      message: `User mới được tạo: ${username}`,
      type: NOTIFICATION_EVENTS.USER_CREATED,
      userId,
      username,
      createdBy,
      timestamp: new Date()
    };

    await this.notifyAdminAndManagers(NOTIFICATION_EVENTS.USER_CREATED, data);
  }

  // Gửi thông báo về thay đổi role
  async notifyUserRoleChanged(userId: string, username: string, newRole: string, changedBy: string): Promise<void> {
    const data: NotificationData = {
      message: `Role của ${username} đã được thay đổi thành ${newRole}`,
      type: NOTIFICATION_EVENTS.USER_ROLE_CHANGED,
      userId,
      username,
      newRole,
      changedBy,
      timestamp: new Date()
    };

    await this.notifyAdminAndManagers(NOTIFICATION_EVENTS.USER_ROLE_CHANGED, data);
  }

  // Gửi thông báo về thay đổi system settings
  async notifySystemSettingsUpdated(settingKey: string, updatedBy: string): Promise<void> {
    const data: NotificationData = {
      message: `Cài đặt hệ thống ${settingKey} đã được cập nhật`,
      type: NOTIFICATION_EVENTS.SYSTEM_SETTINGS_UPDATED,
      settingKey,
      updatedBy,
      timestamp: new Date()
    };

    await this.notifyAdminAndManagers(NOTIFICATION_EVENTS.SYSTEM_SETTINGS_UPDATED, data);
  }

  // Gửi thông báo bảo trì hệ thống
  async notifySystemMaintenance(message: string, startTime?: Date, endTime?: Date): Promise<void> {
    const data: NotificationData = {
      message,
      type: NOTIFICATION_EVENTS.SYSTEM_MAINTENANCE,
      startTime,
      endTime,
      timestamp: new Date()
    };

    await this.notifyAllUsers(NOTIFICATION_EVENTS.SYSTEM_MAINTENANCE, data);
  }
}
