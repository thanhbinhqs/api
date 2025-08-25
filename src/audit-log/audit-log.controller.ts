import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { HasPermission } from '../common/decorators/has-permission.decorator';
import { Permission } from '../common/enums/permission.enum';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @HasPermission(Permission.AUDIT_LOG_READ)
  async findAll(@Query() filterDto: AuditLogFilterDto) {
    return this.auditLogService.findAll(filterDto);
  }

  @Get('by-user')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @HasPermission(Permission.AUDIT_LOG_READ)
  async findByUserId(@Query('userId') userId: string) {
    return this.auditLogService.findByUserId(userId);
  }
}
