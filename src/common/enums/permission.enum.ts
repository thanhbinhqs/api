export enum Permission {
  //APP COMMON CONFIGURATION
  APP_CONFIG_READ = 'appConfig.read',
  APP_CONFIG_UPDATE = 'appConfig.update',

  //USER PERMISSION
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_READ = 'user.read',
  USER_SET_PASSWORD = 'user.setPassword',
  USER_SET_ACTIVE = 'user.setActive',
  USER_SET_ROLE = 'user.setRole',
  USER_SET_PERMISSIONS = 'user.setPermissions',

  //ROLE PERMISSION
  ROLE_CREATE = 'role.create',
  ROLE_UPDATE = 'role.update',
  ROLE_DELETE = 'role.delete',
  ROLE_READ = 'role.read',
  ROLE_SET_PERMISSIONS = 'role.setPermissions',

  //AUDIT LOG PERMISSION
  AUDIT_LOG_READ = 'auditLog.read',

  //SYSTEM SETTINGS PERMISSION
  SYSTEM_SETTING_READ = 'systemSetting.read',
  SYSTEM_SETTING_UPDATE = 'systemSetting.update',

  //FILE MANAGER PERMISSION
  FILE_UPLOAD = 'file.upload',
  FILE_DELETE = 'file.delete',
  FILE_READ = 'file.read',

  //ZONE PERMISSION
  ZONE_CREATE = 'zone.create',
  ZONE_UPDATE = 'zone.update',
  ZONE_DELETE = 'zone.delete',
  ZONE_READ = 'zone.read',

  //LINE PERMISSION
  LINE_CREATE = 'line.create',
  LINE_UPDATE = 'line.update',
  LINE_DELETE = 'line.delete',
  LINE_READ = 'line.read',

  //PROJECT PERMISSION
  PROJECT_CREATE = 'project.create',
  PROJECT_UPDATE = 'project.update',
  PROJECT_DELETE = 'project.delete',
  PROJECT_READ = 'project.read',

  //PROCESS PERMISSION
  PROCESS_CREATE = 'process.create',
  PROCESS_UPDATE = 'process.update',
  PROCESS_DELETE = 'process.delete',
  PROCESS_READ = 'process.read',

  //INOUT HISTORY PERMISSION
  INOUT_HISTORY_CREATE = 'inoutHistory.create',
  INOUT_HISTORY_UPDATE = 'inoutHistory.update',
  INOUT_HISTORY_DELETE = 'inoutHistory.delete',
  INOUT_HISTORY_READ = 'inoutHistory.read',

  //LOCATION PERMISSION
  LOCATION_CREATE = 'location.create',
  LOCATION_UPDATE = 'location.update',
  LOCATION_DELETE = 'location.delete',
  LOCATION_READ = 'location.read',

  //VENDOR PERMISSION
  VENDOR_CREATE = 'vendor.create',
  VENDOR_UPDATE = 'vendor.update',
  VENDOR_DELETE = 'vendor.delete',
  VENDOR_READ = 'vendor.read',

  //PART PERMISSION
  PART_CREATE = 'part.create',
  PART_UPDATE = 'part.update',
  PART_DELETE = 'part.delete',
  PART_READ = 'part.read',

  //PART DETAIL PERMISSION
  PART_DETAIL_CREATE = 'partDetail.create',
  PART_DETAIL_UPDATE = 'partDetail.update',
  PART_DETAIL_DELETE = 'partDetail.delete',
  PART_DETAIL_READ = 'partDetail.read',

  //JIG PERMISSION
  JIG_CREATE = 'jig.create',
  JIG_UPDATE = 'jig.update',
  JIG_DELETE = 'jig.delete',
  JIG_READ = 'jig.read',

  //JIG DETAIL PERMISSION
  JIG_DETAIL_CREATE = 'jigDetail.create',
  JIG_DETAIL_UPDATE = 'jigDetail.update',
  JIG_DETAIL_DELETE = 'jigDetail.delete',
  JIG_DETAIL_READ = 'jigDetail.read',

  //JIG ORDER PERMISSION
  JIG_ORDER_CREATE = 'jigOrder.create',
  JIG_ORDER_UPDATE = 'jigOrder.update',
  JIG_ORDER_DELETE = 'jigOrder.delete',
  JIG_ORDER_READ = 'jigOrder.read',
  JIG_ORDER_APPROVE = 'jigOrder.approve',
  JIG_ORDER_PREPARE = 'jigOrder.prepare',
  JIG_ORDER_PICKUP = 'jigOrder.pickup',

  //TASK PERMISSION
  TASK_CREATE = 'task.create',
  TASK_UPDATE = 'task.update',
  TASK_DELETE = 'task.delete',
  TASK_READ = 'task.read',
  TASK_ASSIGN = 'task.assign',
  TASK_MANAGE_ALL = 'task.manageAll',
}
