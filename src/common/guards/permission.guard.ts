import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../enums/permission.enum';
import { PermissionOptions } from '../decorators/has-permission.decorator';
import { SystemSettingKey } from '../constants/system-settings.constants';
import type { Request } from 'express';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('REQUEST') private request: Request,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check permission
    const permissionOptions = this.reflector.get<PermissionOptions>(
      'has_permission',
      context.getHandler(),
    );

    const role = this.reflector.get<string>('has_role', context.getHandler());

    if (!permissionOptions && !role) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check audit log setting
    const auditLogEnabled =
      request.systemSettings?.[SystemSettingKey.SYSTEM_AUDIT_LOG_ENABLED] ||
      false;
    if (auditLogEnabled) {
      // TODO: Replace with proper logging service
      // console.log(`Permission check for user ${user?.username}`, {
      //   permissions: permissionOptions,
      //   roles: role,
      //   timestamp: new Date().toISOString(),
      // });
    }

    if (role) {
      const userRoles = user.roles?.map((r) => r.name) || [];
      if (!userRoles.includes(role)) {
        return false;
      }
    }

    if (permissionOptions) {
      // Lấy permissions từ user
      const userDirectPermissions = user.permissions || [];

      // Lấy permissions từ các role của user
      const rolePermissions =
        user.roles?.flatMap((role) => role.permissions) || [];

      // Gộp tất cả permissions và loại bỏ trùng lặp
      const allUserPermissions = [
        ...new Set([...userDirectPermissions, ...rolePermissions]),
      ];

      const requiredPermissions = permissionOptions.permissions;

      if (allUserPermissions.some((p) => p == '*')) return true;

      if (permissionOptions.mode === 'AND') {
        return requiredPermissions.every((p) => allUserPermissions.includes(p));
      } else {
        return requiredPermissions.some((p) => allUserPermissions.includes(p));
      }
    }

    return true;
  }
}
