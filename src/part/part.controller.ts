import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PartService } from './part.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartFilterDto } from './dto/part-filter.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';

@ApiTags('Parts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parts')
export class PartController {
  constructor(private readonly partService: PartService) {}

  @Post()
  @HasPermission(Permission.PART_CREATE)
  @ApiOperation({ summary: 'Tạo part mới' })
  @ApiResponse({ status: 201, description: 'Part đã được tạo thành công' })
  @ApiResponse({ status: 409, description: 'Tên hoặc mã part đã tồn tại' })
  create(@Body() createPartDto: CreatePartDto) {
    return this.partService.create(createPartDto);
  }

  @Get()
  @HasPermission(Permission.PART_READ)
  @ApiOperation({ summary: 'Lấy danh sách parts với phân trang và lọc' })
  @ApiResponse({ status: 200, description: 'Danh sách parts' })
  findAll(@Query() filterDto: PartFilterDto) {
    return this.partService.findAll(filterDto);
  }

  @Get('by-code/:code')
  @HasPermission(Permission.PART_READ)
  @ApiOperation({ summary: 'Tìm part theo mã' })
  @ApiResponse({ status: 200, description: 'Thông tin part' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy part' })
  findByCode(@Param('code') code: string) {
    return this.partService.findByCode(code);
  }

  @Get('by-name/:name')
  @HasPermission(Permission.PART_READ)
  @ApiOperation({ summary: 'Tìm part theo tên' })
  @ApiResponse({ status: 200, description: 'Thông tin part' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy part' })
  findByName(@Param('name') name: string) {
    return this.partService.findByName(name);
  }

  @Get(':id')
  @HasPermission(Permission.PART_READ)
  @ApiOperation({ summary: 'Lấy thông tin part theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin part' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy part' })
  findOne(@Param('id') id: string) {
    return this.partService.findOne(id);
  }

  @Patch(':id')
  @HasPermission(Permission.PART_UPDATE)
  @ApiOperation({ summary: 'Cập nhật thông tin part với version checking' })
  @ApiResponse({ status: 200, description: 'Part đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy part' })
  @ApiResponse({ status: 409, description: 'Conflict - Tên/mã part đã tồn tại hoặc dữ liệu đã được cập nhật bởi người khác' })
  update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto) {
    return this.partService.update(id, updatePartDto);
  }

  @Delete(':id')
  @HasPermission(Permission.PART_DELETE)
  @ApiOperation({ summary: 'Xóa part (soft delete)' })
  @ApiResponse({ status: 200, description: 'Part đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy part' })
  remove(@Param('id') id: string) {
    return this.partService.remove(id);
  }

  @Post(':id/update-stock')
  @HasPermission(Permission.PART_UPDATE)
  @ApiOperation({ summary: 'Cập nhật lại số lượng tồn kho từ lịch sử nhập/xuất' })
  @ApiResponse({ status: 200, description: 'Tồn kho đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy part' })
  updateStock(@Param('id') id: string) {
    return this.partService.updateStock(id);
  }

  @Get(':id/stock-summary')
  @HasPermission(Permission.PART_READ)
  @ApiOperation({ summary: 'Lấy thống kê tồn kho chi tiết của part' })
  @ApiResponse({ status: 200, description: 'Thống kê tồn kho' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy part' })
  getStockSummary(@Param('id') id: string) {
    return this.partService.getStockSummary(id);
  }
}
