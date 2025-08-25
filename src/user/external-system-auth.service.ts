import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EncryptionService } from 'src/common/services/encryption.service';
import {
  ExternalSystemAuthInfo,
  ExternalSystemCredentials,
  ExternalSystemAuthStatus,
  ExternalSystemAuthNotification,
} from 'src/common/types/external-system-auth.types';

@Injectable()
export class ExternalSystemAuthService {
  private readonly logger = new Logger(ExternalSystemAuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Thêm hoặc cập nhật thông tin đăng nhập hệ thống bên ngoài
   */
  async setExternalSystemAuth(
    userId: string,
    systemName: string,
    credentials: Partial<ExternalSystemCredentials>,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const currentAuthInfo = user.externalSystemAuthInfo || {};
    
    const updatedCredentials: ExternalSystemCredentials = {
      systemName,
      username: credentials.username,
      password: credentials.password,
      token: credentials.token,
      refreshToken: credentials.refreshToken,
      apiKey: credentials.apiKey,
      baseUrl: credentials.baseUrl,
      expiresAt: credentials.expiresAt,
      lastUpdated: new Date(),
      isActive: credentials.isActive ?? true,
      metadata: credentials.metadata || {},
    };

    currentAuthInfo[systemName] = updatedCredentials;
    user.externalSystemAuthInfo = currentAuthInfo;

    await this.userRepository.save(user);
    this.logger.log(`Updated external system auth for user ${userId}, system ${systemName}`);
  }

  /**
   * Lấy thông tin đăng nhập hệ thống bên ngoài
   */
  async getExternalSystemAuth(
    userId: string,
    systemName: string,
  ): Promise<ExternalSystemCredentials | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.externalSystemAuthInfo) {
      return null;
    }

    const credentials = user.externalSystemAuthInfo[systemName];
    if (!credentials) {
      return null;
    }

    // Kiểm tra trạng thái và tạo thông báo nếu cần
    await this.checkAndNotifyCredentialStatus(user, systemName, credentials);

    return credentials;
  }

  /**
   * Lấy tất cả thông tin đăng nhập hệ thống bên ngoài
   */
  async getAllExternalSystemAuth(userId: string): Promise<ExternalSystemAuthInfo | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }

    return user.externalSystemAuthInfo;
  }

  /**
   * Xóa thông tin đăng nhập hệ thống bên ngoài
   */
  async removeExternalSystemAuth(userId: string, systemName: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.externalSystemAuthInfo) {
      return;
    }

    delete user.externalSystemAuthInfo[systemName];
    await this.userRepository.save(user);
    this.logger.log(`Removed external system auth for user ${userId}, system ${systemName}`);
  }

  /**
   * Kiểm tra trạng thái credentials và tạo thông báo
   */
  private async checkAndNotifyCredentialStatus(
    user: User,
    systemName: string,
    credentials: ExternalSystemCredentials,
  ): Promise<void> {
    const now = new Date();
    let status: ExternalSystemAuthStatus = ExternalSystemAuthStatus.ACTIVE;
    let message = '';

    // Kiểm tra hết hạn
    if (credentials.expiresAt && credentials.expiresAt <= now) {
      status = ExternalSystemAuthStatus.EXPIRED;
      message = `Thông tin đăng nhập hệ thống ${systemName} đã hết hạn`;
    } 
    // Kiểm tra sắp hết hạn (7 ngày)
    else if (credentials.expiresAt) {
      const daysUntilExpiry = Math.ceil(
        (credentials.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 7) {
        status = ExternalSystemAuthStatus.NEEDS_REFRESH;
        message = `Thông tin đăng nhập hệ thống ${systemName} sẽ hết hạn trong ${daysUntilExpiry} ngày`;
      }
    }

    // Kiểm tra trạng thái inactive
    if (!credentials.isActive) {
      status = ExternalSystemAuthStatus.DISABLED;
      message = `Thông tin đăng nhập hệ thống ${systemName} đã bị vô hiệu hóa`;
    }

    // Tạo thông báo nếu cần
    if (status !== ExternalSystemAuthStatus.ACTIVE) {
      await this.addAuthNotification(user, {
        systemName,
        status,
        message,
        expiresAt: credentials.expiresAt,
        createdAt: now,
      });
    }
  }

  /**
   * Thêm thông báo về trạng thái đăng nhập
   */
  private async addAuthNotification(
    user: User,
    notification: ExternalSystemAuthNotification,
  ): Promise<void> {
    if (!user.externalSystemAuthNotifications) {
      user.externalSystemAuthNotifications = [];
    }

    // Kiểm tra xem đã có thông báo tương tự chưa
    const existingNotification = user.externalSystemAuthNotifications.find(
      (n) => n.systemName === notification.systemName && n.status === notification.status,
    );

    if (!existingNotification) {
      user.externalSystemAuthNotifications.push(notification);
      
      // Giữ tối đa 10 thông báo gần nhất
      if (user.externalSystemAuthNotifications.length > 10) {
        user.externalSystemAuthNotifications = user.externalSystemAuthNotifications
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 10);
      }

      await this.userRepository.save(user);
      this.logger.warn(`Created auth notification for user ${user.id}: ${notification.message}`);
    }
  }

  /**
   * Lấy thông báo đăng nhập hệ thống bên ngoài
   */
  async getAuthNotifications(userId: string): Promise<ExternalSystemAuthNotification[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return [];
    }

    return user.externalSystemAuthNotifications || [];
  }

  /**
   * Xóa thông báo đăng nhập
   */
  async clearAuthNotifications(userId: string, systemName?: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return;
    }

    if (systemName) {
      user.externalSystemAuthNotifications = (user.externalSystemAuthNotifications || [])
        .filter(n => n.systemName !== systemName);
    } else {
      user.externalSystemAuthNotifications = [];
    }

    await this.userRepository.save(user);
  }

  /**
   * Cập nhật trạng thái hoạt động của hệ thống
   */
  async updateSystemStatus(
    userId: string,
    systemName: string,
    isActive: boolean,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.externalSystemAuthInfo?.[systemName]) {
      throw new Error('System credentials not found');
    }

    user.externalSystemAuthInfo[systemName].isActive = isActive;
    user.externalSystemAuthInfo[systemName].lastUpdated = new Date();

    await this.userRepository.save(user);
    this.logger.log(`Updated system status for user ${userId}, system ${systemName}: ${isActive}`);
  }
}
