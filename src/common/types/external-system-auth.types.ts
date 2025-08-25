export interface ExternalSystemCredentials {
  systemName: string; // Tên hệ thống bên ngoài
  username?: string;
  password?: string;
  token?: string;
  refreshToken?: string;
  apiKey?: string;
  baseUrl?: string;
  expiresAt?: Date; // Thời gian hết hạn
  lastUpdated: Date; // Lần cập nhật cuối
  isActive: boolean; // Trạng thái hoạt động
  metadata?: Record<string, any>; // Thông tin bổ sung
}

export interface ExternalSystemAuthInfo {
  [systemName: string]: ExternalSystemCredentials;
}

export enum ExternalSystemAuthStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
  NEEDS_REFRESH = 'needs_refresh',
  ERROR = 'error',
}

export interface ExternalSystemAuthNotification {
  systemName: string;
  status: ExternalSystemAuthStatus;
  message: string;
  expiresAt?: Date;
  createdAt: Date;
}
