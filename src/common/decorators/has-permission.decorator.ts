import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permission.enum';

export const HAS_PERMISSION_KEY = 'has_permission';

export type PermissionMode = 'AND' | 'OR';

export interface PermissionOptions {
  permissions: Permission[];
  mode?: PermissionMode;
}

export const HasPermission = (
  permissions: Permission[] | Permission,
  mode: PermissionMode = 'AND',
) => {
  const permissionArray = Array.isArray(permissions)
    ? permissions
    : [permissions];
  return SetMetadata(HAS_PERMISSION_KEY, {
    permissions: permissionArray,
    mode,
  } as PermissionOptions);
};
