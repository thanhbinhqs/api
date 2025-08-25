import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { HasPermission } from '../common/decorators/has-permission.decorator';
import { Permission } from '../common/enums/permission.enum';
import { PaginationDto, SortDto } from '../common/dto/pagination.dto';
import { SystemSettingFilterDto } from './dto/system-setting-filter.dto';
import { SystemSettingsService } from './system-settings.service';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { UpdateMultipleSystemSettingsDto } from './dto/update-multiple-system-settings.dto';

@Controller('system-settings')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  @HasPermission(Permission.SYSTEM_SETTING_READ)
  async getAllSettings(
    @Query() pagination: PaginationDto,
    @Query() sort: SortDto,
    @Query() filter: SystemSettingFilterDto,
  ) {
    return this.settingsService.getAllSettings(
      pagination.page,
      pagination.limit,
      sort.sortBy && sort.sortOrder
        ? { field: sort.sortBy, order: sort.sortOrder }
        : undefined,
      filter,
    );
  }

  @Get(':key')
  @HasPermission(Permission.SYSTEM_SETTING_READ)
  async getSetting(@Param('key') key: string) {
    return this.settingsService.getSetting(key);
  }

  @Put()
  @HasPermission(Permission.SYSTEM_SETTING_UPDATE)
  async updateMultipleSettings(
    @Body() updateDto: UpdateMultipleSystemSettingsDto,
  ) {
    return this.settingsService.updateMultipleSettings(updateDto.settings);
  }
}
