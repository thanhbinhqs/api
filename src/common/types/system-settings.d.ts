import { SystemSetting } from '../../system-settings/entities/system-setting.entity';

declare module 'express' {
  interface Request {
    systemSettings: SystemSetting[];
  }
}
