import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SystemSettingsService } from '../../system-settings/system-settings.service';
import { SystemSetting } from '../../system-settings/entities/system-setting.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SystemSettingsMiddleware implements NestMiddleware {
  constructor(
    private readonly systemSettingsService: SystemSettingsService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { data } = await this.systemSettingsService.getAllSettings(1, 1000);
      const secret = this.configService.get("JWT_SECRET");
      req.systemSettings = data;
      req.secret = secret;
    } catch (error) {
      console.error('Failed to load system settings:', error);
    }
    next();
  }
}
