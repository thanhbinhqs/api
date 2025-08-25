import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ExternalSystemAuthService } from './external-system-auth.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';
import type {
  ExternalSystemCredentials,
  ExternalSystemAuthNotification,
} from 'src/common/types/external-system-auth.types';
import {
  CreateExternalSystemAuthDto,
  UpdateSystemStatusDto,
  ClearNotificationsDto,
} from './dto/external-system-auth.dto';

@Controller('external-system-auth')
@UseGuards(JwtAuthGuard)
export class ExternalSystemAuthController {
  constructor(
    private readonly externalSystemAuthService: ExternalSystemAuthService,
  ) {}

  @Post()
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.USER_UPDATE)
  async createOrUpdateAuth(
    @Req() req: Request,
    @Body() createDto: CreateExternalSystemAuthDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }
    await this.externalSystemAuthService.setExternalSystemAuth(
      userId,
      createDto.systemName,
      createDto,
    );
    return { message: 'Thông tin đăng nhập hệ thống bên ngoài đã được cập nhật' };
  }

  @Get(':systemName')
  async getAuth(
    @Req() req: Request,
    @Param('systemName') systemName: string,
  ): Promise<ExternalSystemCredentials | null> {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }
    return this.externalSystemAuthService.getExternalSystemAuth(userId, systemName);
  }

  @Get()
  async getAllAuth(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }
    return this.externalSystemAuthService.getAllExternalSystemAuth(userId);
  }

  @Put(':systemName/status')
  async updateSystemStatus(
    @Req() req: Request,
    @Param('systemName') systemName: string,
    @Body() updateDto: UpdateSystemStatusDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }
    await this.externalSystemAuthService.updateSystemStatus(
      userId,
      systemName,
      updateDto.isActive,
    );
    return { message: 'Trạng thái hệ thống đã được cập nhật' };
  }

  @Delete(':systemName')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.USER_DELETE)
  async removeAuth(
    @Req() req: Request,
    @Param('systemName') systemName: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }
    await this.externalSystemAuthService.removeExternalSystemAuth(userId, systemName);
    return { message: 'Thông tin đăng nhập hệ thống bên ngoài đã được xóa' };
  }

  @Get('notifications/all')
  async getNotifications(@Req() req: Request): Promise<ExternalSystemAuthNotification[]> {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }
    return this.externalSystemAuthService.getAuthNotifications(userId);
  }

  @Delete('notifications/clear')
  async clearNotifications(
    @Req() req: Request,
    @Body() clearDto?: ClearNotificationsDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }
    await this.externalSystemAuthService.clearAuthNotifications(
      userId,
      clearDto?.systemName,
    );
    return { message: 'Thông báo đã được xóa' };
  }
}
