import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JigDetailService } from './jig-detail.service';
import { CreateJigDetailDto } from './dto/create-jig-detail.dto';
import { UpdateJigDetailDto } from './dto/update-jig-detail.dto';
import { JigDetailFilterDto } from './dto/jig-detail-filter.dto';
import { BatchUpdateJigDetailStatusDto } from './dto/batch-update-jig-detail-status.dto';
import { JigDetail, JigStatus } from './entities/jig-detail.entity';
import { PaginatedResult } from 'src/common/dto/paginated-result.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';

@ApiTags('Jig Details')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jig-details')
export class JigDetailController {
  constructor(private readonly jigDetailService: JigDetailService) {}

  @Post()
  @HasPermission(Permission.JIG_DETAIL_CREATE)
  @ApiOperation({ summary: 'Tạo jig detail mới' })
  @ApiResponse({ status: 201, description: 'Jig detail đã được tạo thành công', type: JigDetail })
  async create(@Body() createJigDetailDto: CreateJigDetailDto): Promise<JigDetail> {
    return await this.jigDetailService.create(createJigDetailDto);
  }

  @Get()
  @HasPermission(Permission.JIG_DETAIL_READ)
  @ApiOperation({ summary: 'Lấy danh sách jig details' })
  @ApiResponse({ status: 200, description: 'Danh sách jig details', type: PaginatedResult })
  async findAll(@Query() filterDto: JigDetailFilterDto): Promise<PaginatedResult<JigDetail>> {
    return await this.jigDetailService.findAll(filterDto);
  }

  @Get('by-code/:code')
  @HasPermission(Permission.JIG_DETAIL_READ)
  @ApiOperation({ summary: 'Lấy jig detail theo code' })
  @ApiResponse({ status: 200, description: 'Thông tin jig detail', type: JigDetail })
  async findByCode(@Param('code') code: string): Promise<JigDetail | null> {
    return await this.jigDetailService.findByCode(code);
  }

  @Get('by-mes-code/:mesCode')
  @HasPermission(Permission.JIG_DETAIL_READ)
  @ApiOperation({ summary: 'Lấy jig detail theo MES code' })
  @ApiResponse({ status: 200, description: 'Thông tin jig detail', type: JigDetail })
  async findByMesCode(@Param('mesCode') mesCode: string): Promise<JigDetail | null> {
    return await this.jigDetailService.findByMesCode(mesCode);
  }

  @Get('by-jig/:jigId')
  @HasPermission(Permission.JIG_DETAIL_READ)
  @ApiOperation({ summary: 'Lấy danh sách jig details theo jig ID' })
  @ApiResponse({ status: 200, description: 'Danh sách jig details của jig', type: [JigDetail] })
  async findByJig(@Param('jigId') jigId: string): Promise<JigDetail[]> {
    return await this.jigDetailService.getJigDetailsByJig(jigId);
  }

  @Get('maintenance/needed')
  @HasPermission(Permission.JIG_DETAIL_READ)
  @ApiOperation({ summary: 'Lấy danh sách jig details cần bảo trì' })
  @ApiResponse({ status: 200, description: 'Danh sách jig details cần bảo trì', type: [JigDetail] })
  async getJigDetailsNeedingMaintenance(@Query('days') days?: number): Promise<JigDetail[]> {
    return await this.jigDetailService.getJigDetailsNeedingMaintenance(days);
  }

  @Get(':id')
  @HasPermission(Permission.JIG_DETAIL_READ)
  @ApiOperation({ summary: 'Lấy thông tin jig detail theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin jig detail', type: JigDetail })
  async findOne(@Param('id') id: string): Promise<JigDetail> {
    return await this.jigDetailService.findOne(id);
  }

  @Patch(':id')
  @HasPermission(Permission.JIG_DETAIL_UPDATE)
  @ApiOperation({ summary: 'Cập nhật jig detail' })
  @ApiResponse({ status: 200, description: 'Jig detail đã được cập nhật', type: JigDetail })
  async update(@Param('id') id: string, @Body() updateJigDetailDto: UpdateJigDetailDto): Promise<JigDetail> {
    return await this.jigDetailService.update(id, updateJigDetailDto);
  }

  @Patch(':id/status')
  @HasPermission(Permission.JIG_DETAIL_UPDATE)
  @ApiOperation({ summary: 'Cập nhật trạng thái jig detail' })
  @ApiResponse({ status: 200, description: 'Trạng thái jig detail đã được cập nhật', type: JigDetail })
  async updateStatus(@Param('id') id: string, @Body('status') status: JigStatus): Promise<JigDetail> {
    return await this.jigDetailService.updateStatus(id, status);
  }

  @Patch(':id/location')
  @HasPermission(Permission.JIG_DETAIL_UPDATE)
  @ApiOperation({ summary: 'Cập nhật vị trí jig detail' })
  @ApiResponse({ status: 200, description: 'Vị trí jig detail đã được cập nhật', type: JigDetail })
  async updateLocation(
    @Param('id') id: string,
    @Body() body: { locationId?: string; lineId?: string; vendorId?: string }
  ): Promise<JigDetail> {
    const { locationId, lineId, vendorId } = body;
    return await this.jigDetailService.updateLocation(id, locationId || null, lineId || null, vendorId || null);
  }

  @Patch(':id/maintenance')
  @HasPermission(Permission.JIG_DETAIL_UPDATE)
  @ApiOperation({ summary: 'Cập nhật ngày bảo trì jig detail' })
  @ApiResponse({ status: 200, description: 'Ngày bảo trì đã được cập nhật', type: JigDetail })
  async updateMaintenanceDate(@Param('id') id: string, @Body('maintenanceDate') maintenanceDate: Date): Promise<JigDetail> {
    return await this.jigDetailService.updateMaintenanceDate(id, maintenanceDate);
  }

  @Delete(':id')
  @HasPermission(Permission.JIG_DETAIL_DELETE)
  @ApiOperation({ summary: 'Xóa jig detail' })
  @ApiResponse({ status: 200, description: 'Jig detail đã được xóa' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.jigDetailService.remove(id);
    return { message: 'Jig detail đã được xóa thành công' };
  }

  @Patch('batch/status')
  @HasPermission(Permission.JIG_DETAIL_UPDATE)
  @ApiOperation({ summary: 'Cập nhật trạng thái hàng loạt cho nhiều jig details' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả cập nhật batch',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'array', items: { type: 'string' } },
        failed: { type: 'array', items: { 
          type: 'object',
          properties: {
            id: { type: 'string' },
            error: { type: 'string' }
          }
        }},
        total: { type: 'number' }
      }
    }
  })
  async batchUpdateStatus(@Body() batchUpdateDto: BatchUpdateJigDetailStatusDto) {
    return await this.jigDetailService.batchUpdateStatus(batchUpdateDto);
  }

  @Patch(':id/default-locations')
  @HasPermission(Permission.JIG_DETAIL_UPDATE)
  @ApiOperation({ summary: 'Thiết lập vị trí mặc định cho jig detail' })
  @ApiResponse({ status: 200, description: 'Vị trí mặc định đã được thiết lập' })
  async setDefaultLocations(
    @Param('id') id: string,
    @Body() body: { locationId?: string; lineId?: string; vendorId?: string }
  ) {
    return await this.jigDetailService.setDefaultLocations(id, body.locationId, body.lineId, body.vendorId);
  }

  @Patch(':id/restore-default')
  @HasPermission(Permission.JIG_DETAIL_UPDATE)
  @ApiOperation({ summary: 'Khôi phục jig detail về vị trí mặc định' })
  @ApiResponse({ status: 200, description: 'Jig detail đã được khôi phục về vị trí mặc định' })
  async restoreToDefaultLocations(@Param('id') id: string) {
    return await this.jigDetailService.restoreToDefaultLocations(id);
  }
}
