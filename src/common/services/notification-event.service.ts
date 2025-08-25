import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NOTIFICATION_EVENTS } from '../constants/notification-events';

@Injectable()
export class NotificationEventService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  // Task events
  emitTaskCreated(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.TASK_CREATED, data);
  }

  emitTaskUpdated(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.TASK_UPDATED, data);
  }

  emitTaskAssigned(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.TASK_ASSIGNED, data);
  }

  emitTaskCompleted(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.TASK_COMPLETED, data);
  }

  emitTaskOverdue(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.TASK_OVERDUE, data);
  }

  emitTaskDueSoon(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.TASK_DUE_SOON, data);
  }

  // User events
  emitUserCreated(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.USER_CREATED, data);
  }

  emitUserRoleChanged(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.USER_ROLE_CHANGED, data);
  }

  // Jig events
  emitJigCreated(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.JIG_CREATED, data);
  }

  emitJigMaintenanceDue(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.JIG_MAINTENANCE_DUE, data);
  }

  // Part events
  emitPartStockLow(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.PART_STOCK_LOW, data);
  }

  // System events
  emitSystemSettingsUpdated(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.SYSTEM_SETTINGS_UPDATED, data);
  }

  emitSystemMaintenance(data: any) {
    this.eventEmitter.emit(NOTIFICATION_EVENTS.SYSTEM_MAINTENANCE, data);
  }
}
