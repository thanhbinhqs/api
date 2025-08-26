import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { SystemSettingKey } from '../constants/system-settings.constants';
import type { Request } from 'express';

@Injectable()
export class EncryptionService {
  private algorithm: string;
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(
    private configService: ConfigService,
    @Inject('REQUEST')
    private request: { systemSettings?: Record<string, any> },
  ) {
    this.algorithm =
      this.request.systemSettings?.[
        SystemSettingKey.SECURITY_ENCRYPTION_ALGORITHM
      ] || 'aes-256-cbc';

    // Log if audit enabled
    const auditLogEnabled =
      this.request.systemSettings?.[
        SystemSettingKey.SYSTEM_AUDIT_LOG_ENABLED
      ] || false;
    if (auditLogEnabled) {
      // TODO: Replace with proper logging service
      // console.log(`Initializing encryption service with algorithm: ${this.algorithm}`);
    }
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    const encryptionIv = this.configService.get<string>('ENCRYPTION_IV');

    if (!encryptionKey || !encryptionIv) {
      throw new Error('Encryption key and IV must be configured');
    }

    this.key = crypto.createHash('sha256').update(encryptionKey).digest();
    this.iv = Buffer.from(encryptionIv, 'hex');

    // Validate IV length (16 bytes for aes-256-cbc)
    if (this.iv.length !== 16) {
      throw new Error('Invalid IV length. Must be 16 bytes for aes-256-cbc');
    }
  }

  encrypt(data: any): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedData: string): any {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
}
