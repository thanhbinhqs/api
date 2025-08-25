import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Permission } from '../common/enums/permission.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { HasPermission } from '../common/decorators/has-permission.decorator';

@ApiTags('Permission')
@Controller('permission')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermissionController {
  @Get()
  @HasPermission(
    [Permission.ROLE_SET_PERMISSIONS, Permission.USER_SET_PERMISSIONS],
    'OR',
  )
  @ApiResponse({
    status: 200,
    description: 'Get all permissions',
    type: [String],
  })
  getAllPermissions(): string[] {
    return Object.values(Permission);
  }
}
