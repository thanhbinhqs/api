export enum SystemSettingKey {
  // System Settings
  SYSTEM_NAME = 'system.name',
  SYSTEM_LOGO = 'system.logo',
  SYSTEM_TIMEZONE = 'system.timezone',
  SYSTEM_LANGUAGE = 'system.language',
  SYSTEM_DATE_FORMAT = 'system.dateFormat',
  SYSTEM_LOG_LEVEL = 'system.logLevel',
  SYSTEM_AUDIT_LOG_ENABLED = 'system.auditLogEnabled',
  SYSTEM_CACHE_TYPE = 'system.cacheType',
  SYSTEM_CACHE_TTL = 'system.cacheTTL',

  // Business Settings
  AUTH_MAX_LOGIN_ATTEMPTS = 'auth.maxLoginAttempts',
  AUTH_LOCKOUT_DURATION = 'auth.lockoutDuration',
  AUTH_PASSWORD_EXPIRY_DAYS = 'auth.passwordExpiryDays',
  AUTH_ALLOW_MULTI_DEVICE_LOGIN = 'auth.allowMultiDeviceLogin',
  EMAIL_SMTP_HOST = 'email.smtpHost',
  EMAIL_SMTP_PORT = 'email.smtpPort',
  EMAIL_SMTP_USER = 'email.smtpUser',
  EMAIL_SMTP_PASS = 'email.smtpPass',
  FILE_MAX_UPLOAD_SIZE = 'file.maxUploadSize',
  FILE_ALLOWED_TYPES = 'file.allowedTypes',

  // Security Settings
  SECURITY_JWT_EXPIRY = 'security.jwtExpiry',
  SECURITY_REFRESH_TOKEN_EXPIRY = 'security.refreshTokenExpiry',
  SECURITY_JWT_ALGORITHM = 'security.jwtAlgorithm',
  SECURITY_ENCRYPTION_ALGORITHM = 'security.encryptionAlgorithm',
  SECURITY_CORS_ORIGINS = 'security.corsOrigins',
  SECURITY_RATE_LIMIT_PUBLIC = 'security.rateLimitPublic',
  SECURITY_RATE_LIMIT_PRIVATE = 'security.rateLimitPrivate',
}

export const DEFAULT_SYSTEM_SETTINGS = {
  // System Settings
  'system.name': 'BPlus API',
  'system.logo': '',
  'system.timezone': 'Asia/Bangkok',
  'system.language': 'vi',
  'system.dateFormat': 'DD/MM/YYYY',
  'system.logLevel': 'info',
  'system.auditLogEnabled': true,
  'system.cacheType': 'redis',
  'system.cacheTTL': 3600,

  // Business Settings
  'auth.maxLoginAttempts': 5,
  'auth.lockoutDuration': 30,
  'auth.passwordExpiryDays': 90,
  'auth.allowMultiDeviceLogin': false,
  'email.smtpHost': '',
  'email.smtpPort': 587,
  'email.smtpUser': '',
  'email.smtpPass': '',
  'file.maxUploadSize': 10,
  'file.allowedTypes': ['jpg', 'png', 'pdf', 'docx'],

  // Security Settings
  'security.jwtExpiry': '1h',
  'security.refreshTokenExpiry': '7d',
  'security.jwtAlgorithm': 'HS256',
  'security.encryptionAlgorithm': 'aes-256-cbc',
  'security.corsOrigins': ['http://localhost:3000'],
  'security.rateLimitPublic': 100,
  'security.rateLimitPrivate': 1000,
};
