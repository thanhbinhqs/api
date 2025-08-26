export const NOTIFICATION_EVENTS = {
  // Task events
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  TASK_OVERDUE: 'task_overdue',
  TASK_STATUS_CHANGED: 'task_status_changed',
  TASK_DUE_SOON: 'task_due_soon',

  // User events
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_ROLE_CHANGED: 'user_role_changed',

  // Jig events
  JIG_CREATED: 'jig_created',
  JIG_UPDATED: 'jig_updated',
  JIG_MAINTENANCE_DUE: 'jig_maintenance_due',
  JIG_STATUS_CHANGED: 'jig_status_changed',

  // Part events
  PART_CREATED: 'part_created',
  PART_UPDATED: 'part_updated',
  PART_STOCK_LOW: 'part_stock_low',

  // System events
  SYSTEM_SETTINGS_UPDATED: 'system_settings_updated',
  SYSTEM_MAINTENANCE: 'system_maintenance',

  // Audit events
  AUDIT_LOG_CREATED: 'audit_log_created',
} as const;

export type NotificationEvent =
  (typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS];

export interface NotificationData {
  message: string;
  type: NotificationEvent;
  timestamp?: Date;
  [key: string]: any;
}
