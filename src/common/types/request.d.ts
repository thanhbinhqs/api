import { User } from '../../user/entities/user.entity';
import { Role } from '../../user/entities/role.entity';
import { Permission } from '../enums/permission.enum';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      username: string;
      email?: string;
      roles: Role[];
      permissions: Permission[];
      tokenVersion: string;
    };
    secret: string;
  }
}
