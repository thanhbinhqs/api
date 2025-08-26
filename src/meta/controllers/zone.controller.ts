import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ZoneService } from '../services/zone.service';
import { CreateZoneDto } from '../dto/zone/create-zone.dto';
import { UpdateZoneDto } from '../dto/zone/update-zone.dto';
import { ZoneFilterDto } from '../dto/zone/zone-filter.dto';
import { Zone } from '../entities/zone.entity';
import { PaginatedResult } from 'src/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';

@ApiTags('Zones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('zones')
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) {}

  @Post()
  @HasPermission(Permission.ZONE_CREATE)
  @ApiOperation({ summary: 'Tạo zone mới' })
  @ApiResponse({
    status: 201,
    description: 'Zone đã được tạo thành công',
    type: Zone,
  })
  @ApiResponse({
    status: 409,
    description: 'Zone với tên hoặc slug đã tồn tại',
  })
  async create(@Body() createZoneDto: CreateZoneDto): Promise<Zone> {
    return this.zoneService.createZone(createZoneDto);
  }

  @Get()
  @HasPermission(Permission.ZONE_READ)
  @ApiOperation({ summary: 'Lấy danh sách zones với filter và phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách zones',
    type: PaginatedResult<Zone>,
  })
  async findAll(
    @Query() filterDto: ZoneFilterDto,
  ): Promise<PaginatedResult<Zone>> {
    return this.zoneService.findAllZones(filterDto);
  }

  @Get('simple')
  @HasPermission(Permission.ZONE_READ)
  @ApiOperation({ summary: 'Lấy danh sách zones đơn giản không phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách zones đơn giản',
    type: [Zone],
  })
  async findAllSimple(): Promise<Zone[]> {
    return this.zoneService.findAllZonesSimple();
  }

  @Get('slug/:slug')
  @HasPermission(Permission.ZONE_READ)
  @ApiOperation({ summary: 'Lấy zone theo slug' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin zone',
    type: Zone,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy zone',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Zone> {
    const zone = await this.zoneService.findZoneBySlug(slug);
    if (!zone) {
      throw new NotFoundException(`Zone với slug "${slug}" không tồn tại`);
    }
    return zone;
  }

  @Get(':id')
  @HasPermission(Permission.ZONE_READ)
  @ApiOperation({ summary: 'Lấy zone theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin zone',
    type: Zone,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy zone',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Zone> {
    const zone = await this.zoneService.findZoneById(id);
    if (!zone) {
      throw new NotFoundException(`Zone với ID "${id}" không tồn tại`);
    }
    return zone;
  }

  @Get(':id/hierarchy')
  @HasPermission(Permission.ZONE_READ)
  @ApiOperation({ summary: 'Lấy cây phân cấp của zone' })
  @ApiResponse({
    status: 200,
    description: 'Cây phân cấp zone',
    type: [Zone],
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy zone',
  })
  async getHierarchy(@Param('id', ParseUUIDPipe) id: string): Promise<Zone[]> {
    return this.zoneService.getZoneHierarchy(id);
  }

  @Get(':id/children')
  @HasPermission(Permission.ZONE_READ)
  @ApiOperation({ summary: 'Lấy danh sách zones con' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách zones con',
    type: [Zone],
  })
  async findChildren(@Param('id', ParseUUIDPipe) id: string): Promise<Zone[]> {
    return this.zoneService.findZonesByParent(id);
  }

  @Patch(':id')
  @HasPermission(Permission.ZONE_UPDATE)
  @ApiOperation({ summary: 'Cập nhật zone' })
  @ApiResponse({
    status: 200,
    description: 'Zone đã được cập nhật thành công',
    type: Zone,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy zone',
  })
  @ApiResponse({
    status: 409,
    description: 'Zone với tên hoặc slug đã tồn tại',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateZoneDto: UpdateZoneDto,
  ): Promise<Zone> {
    return this.zoneService.updateZone(id, updateZoneDto);
  }

  @Delete(':id')
  @HasPermission(Permission.ZONE_DELETE)
  @ApiOperation({ summary: 'Xóa zone' })
  @ApiResponse({
    status: 200,
    description: 'Zone đã được xóa thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy zone',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.zoneService.deleteZone(id);
    return { message: 'Zone đã được xóa thành công' };
  }
}
