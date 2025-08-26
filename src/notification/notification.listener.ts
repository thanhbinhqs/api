import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { NOTIFICATION_EVENTS } from '../common/constants/notification-events';
import { Permission } from '../common/enums/permission.enum';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(private readonly notificationService: NotificationService) {}

  // Task event listeners
  @OnEvent(NOTIFICATION_EVENTS.TASK_CREATED)
  async handleTaskCreated(data: any) {
    await this.sendTaskNotification(
      data.task,
      NOTIFICATION_EVENTS.TASK_CREATED,
      data,
    );
  }

  @OnEvent(NOTIFICATION_EVENTS.TASK_UPDATED)
  async handleTaskUpdated(data: any) {
    await this.sendTaskNotification(
      data.task,
      NOTIFICATION_EVENTS.TASK_UPDATED,
      data,
    );
  }

  @OnEvent(NOTIFICATION_EVENTS.TASK_ASSIGNED)
  async handleTaskAssigned(data: any) {
    await this.sendTaskNotification(
      data.task,
      NOTIFICATION_EVENTS.TASK_ASSIGNED,
      data,
    );
  }

  @OnEvent(NOTIFICATION_EVENTS.TASK_COMPLETED)
  async handleTaskCompleted(data: any) {
    await this.sendTaskNotification(
      data.task,
      NOTIFICATION_EVENTS.TASK_COMPLETED,
      data,
    );
  }

  @OnEvent(NOTIFICATION_EVENTS.TASK_OVERDUE)
  async handleTaskOverdue(data: any) {
    await this.sendTaskNotification(
      data.task,
      NOTIFICATION_EVENTS.TASK_OVERDUE,
      data,
    );
  }

  @OnEvent(NOTIFICATION_EVENTS.TASK_DUE_SOON)
  async handleTaskDueSoon(data: any) {
    await this.sendTaskNotification(
      data.task,
      NOTIFICATION_EVENTS.TASK_DUE_SOON,
      data,
    );
  }

  // User event listeners
  @OnEvent(NOTIFICATION_EVENTS.USER_CREATED)
  async handleUserCreated(data: any) {
    try {
      await this.notificationService.sendToRole(
        'admin',
        NOTIFICATION_EVENTS.USER_CREATED,
        data,
      );
      await this.notificationService.sendToRole(
        'manager',
        NOTIFICATION_EVENTS.USER_CREATED,
        data,
      );
    } catch (error) {
      this.logger.error(
        `Error sending user created notification: ${error.message}`,
      );
    }
  }

  @OnEvent(NOTIFICATION_EVENTS.USER_ROLE_CHANGED)
  async handleUserRoleChanged(data: any) {
    try {
      await this.notificationService.sendToRole(
        'admin',
        NOTIFICATION_EVENTS.USER_ROLE_CHANGED,
        data,
      );
      await this.notificationService.sendToRole(
        'manager',
        NOTIFICATION_EVENTS.USER_ROLE_CHANGED,
        data,
      );
      // Also notify the user whose role changed
      if (data.userId) {
        await this.notificationService.sendToUser(
          data.userId,
          NOTIFICATION_EVENTS.USER_ROLE_CHANGED,
          data,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error sending user role changed notification: ${error.message}`,
      );
    }
  }

  // Jig event listeners
  @OnEvent(NOTIFICATION_EVENTS.JIG_MAINTENANCE_DUE)
  async handleJigMaintenanceDue(data: any) {
    try {
      await this.notificationService.sendToPermission(
        Permission.JIG_UPDATE,
        NOTIFICATION_EVENTS.JIG_MAINTENANCE_DUE,
        data,
      );
    } catch (error) {
      this.logger.error(
        `Error sending jig maintenance notification: ${error.message}`,
      );
    }
  }

  // Part event listeners
  @OnEvent(NOTIFICATION_EVENTS.PART_STOCK_LOW)
  async handlePartStockLow(data: any) {
    try {
      await this.notificationService.sendToPermission(
        Permission.PART_UPDATE,
        NOTIFICATION_EVENTS.PART_STOCK_LOW,
        data,
      );
    } catch (error) {
      this.logger.error(
        `Error sending part stock low notification: ${error.message}`,
      );
    }
  }

  // System event listeners
  @OnEvent(NOTIFICATION_EVENTS.SYSTEM_SETTINGS_UPDATED)
  async handleSystemSettingsUpdated(data: any) {
    try {
      await this.notificationService.sendToRole(
        'admin',
        NOTIFICATION_EVENTS.SYSTEM_SETTINGS_UPDATED,
        data,
      );
      await this.notificationService.sendToRole(
        'manager',
        NOTIFICATION_EVENTS.SYSTEM_SETTINGS_UPDATED,
        data,
      );
    } catch (error) {
      this.logger.error(
        `Error sending system settings updated notification: ${error.message}`,
      );
    }
  }

  @OnEvent(NOTIFICATION_EVENTS.SYSTEM_MAINTENANCE)
  async handleSystemMaintenance(data: any) {
    try {
      await this.notificationService.sendToAll(
        NOTIFICATION_EVENTS.SYSTEM_MAINTENANCE,
        data,
      );
    } catch (error) {
      this.logger.error(
        `Error sending system maintenance notification: ${error.message}`,
      );
    }
  }

  // Helper method for task notifications
  private async sendTaskNotification(
    task: any,
    event: string,
    data: any,
  ): Promise<void> {
    try {
      // Gửi thông báo đến các user được assign trực tiếp
      if (task.assignedUsers?.length) {
        for (const user of task.assignedUsers) {
          await this.notificationService.sendToUser(user.id, event, data);
        }
      }

      // Gửi thông báo đến các role được assign
      if (task.assignedRoles?.length) {
        for (const role of task.assignedRoles) {
          await this.notificationService.sendToRole(role.name, event, data);
        }
      }

      // Gửi thông báo đến người tạo task (nếu không phải người được assign)
      if (task.taskCreatedBy) {
        const isAssignedUser = task.assignedUsers?.some(
          (user: any) => user.id === task.taskCreatedBy.id,
        );
        if (!isAssignedUser) {
          await this.notificationService.sendToUser(
            task.taskCreatedBy.id,
            event,
            data,
          );
        }
      }

      // Gửi thông báo đến người thực hiện task (nếu có và khác với người tạo và assigned users)
      if (task.executedBy) {
        const isCreator = task.executedBy.id === task.taskCreatedBy?.id;
        const isAssignedUser = task.assignedUsers?.some(
          (user: any) => user.id === task.executedBy.id,
        );
        if (!isCreator && !isAssignedUser) {
          await this.notificationService.sendToUser(
            task.executedBy.id,
            event,
            data,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error sending task notification: ${error.message}`);
    }
  }
}
