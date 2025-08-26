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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PartDetailService } from './part-detail.service';
import { CreatePartDetailDto } from './dto/create-part-detail.dto';
import { UpdatePartDetailDto } from './dto/update-part-detail.dto';
import { PartDetailFilterDto } from './dto/part-detail-filter.dto';
import { BatchUpdateStatusDto } from './dto/batch-update-status.dto';
import { BatchUpdatePartDetailStatusDto } from './dto/batch-update-part-detail-status.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';

@ApiTags('Part Details')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('part-details')
export class PartDetailController {
  constructor(private readonly partDetailService: PartDetailService) {}

  @Post()
  @HasPermission(Permission.PART_DETAIL_CREATE)
  @ApiOperation({ summary: 'Tạo part detail mới' })
  @ApiResponse({
    status: 201,
    description: 'Part detail đã được tạo thành công',
  })
  @ApiResponse({ status: 409, description: 'Số serial đã tồn tại' })
  create(@Body() createPartDetailDto: CreatePartDetailDto) {
    return this.partDetailService.create(createPartDetailDto);
  }

  @Get()
  @HasPermission(Permission.PART_DETAIL_READ)
  @ApiOperation({ summary: 'Lấy danh sách part details với phân trang và lọc' })
  @ApiResponse({ status: 200, description: 'Danh sách part details' })
  findAll(@Query() filterDto: PartDetailFilterDto) {
    return this.partDetailService.findAll(filterDto);
  }

  @Get('by-serial/:serialNumber')
  @HasPermission(Permission.PART_DETAIL_READ)
  @ApiOperation({ summary: 'Tìm part detail theo số serial' })
  @ApiResponse({ status: 200, description: 'Thông tin part detail' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy part detail' })
  findBySerialNumber(@Param('serialNumber') serialNumber: string) {
    return this.partDetailService.findBySerialNumber(serialNumber);
  }

  @Get('by-part/:partId')
  @HasPermission(Permission.PART_DETAIL_READ)
  @ApiOperation({ summary: 'Lấy danh sách part details theo part ID' })
  @ApiResponse({ status: 200, description: 'Danh sách part details' })
  findByPartId(@Param('partId') partId: string) {
    return this.partDetailService.findByPartId(partId);
  }

  @Get(':id')
  @HasPermission(Permission.PART_DETAIL_READ)
  @ApiOperation({ summary: 'Lấy thông tin part detail theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin part detail' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy part detail' })
  findOne(@Param('id') id: string) {
    return this.partDetailService.findOne(id);
  }

  @Patch(':id')
  @HasPermission(Permission.PART_DETAIL_UPDATE)
  @ApiOperation({
    summary: 'Cập nhật thông tin part detail với version checking',
  })
  @ApiResponse({ status: 200, description: 'Part detail đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy part detail' })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Số serial đã tồn tại hoặc dữ liệu đã được cập nhật bởi người khác',
  })
  update(
    @Param('id') id: string,
    @Body() updatePartDetailDto: UpdatePartDetailDto,
  ) {
    return this.partDetailService.update(id, updatePartDetailDto);
  }

  @Patch('batch-status')
  @HasPermission(Permission.PART_DETAIL_UPDATE)
  @ApiOperation({
    summary: 'Cập nhật status hàng loạt cho part details với version checking',
  })
  @ApiResponse({ status: 200, description: 'Status đã được cập nhật' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Dữ liệu đã được cập nhật bởi người khác',
  })
  updateStatusBatch(@Body() batchUpdateDto: BatchUpdateStatusDto) {
    return this.partDetailService.updateStatusBatch(
      batchUpdateDto.partDetailIds,
      batchUpdateDto.newStatus,
      batchUpdateDto.versions,
    );
  }

  @Delete(':id')
  @HasPermission(Permission.PART_DETAIL_DELETE)
  @ApiOperation({ summary: 'Xóa part detail (soft delete)' })
  @ApiResponse({ status: 200, description: 'Part detail đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy part detail' })
  remove(@Param('id') id: string) {
    return this.partDetailService.remove(id);
  }

  @Get('by-jig-detail/:jigDetailId')
  @HasPermission(Permission.PART_DETAIL_READ)
  @ApiOperation({ summary: 'Lấy danh sách part details theo jig detail ID' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách part details của jig detail',
  })
  findByJigDetail(@Param('jigDetailId') jigDetailId: string) {
    return this.partDetailService.findByJigDetail(jigDetailId);
  }

  @Patch(':id/jig-detail')
  @HasPermission(Permission.PART_DETAIL_UPDATE)
  @ApiOperation({ summary: 'Cập nhật jig detail cho part detail' })
  @ApiResponse({ status: 200, description: 'Jig detail đã được cập nhật' })
  updateJigDetail(
    @Param('id') id: string,
    @Body('jigDetailId') jigDetailId: string | null,
  ) {
    return this.partDetailService.updateJigDetail(id, jigDetailId);
  }

  @Patch('batch/status')
  @HasPermission(Permission.PART_DETAIL_UPDATE)
  @ApiOperation({
    summary: 'Cập nhật trạng thái hàng loạt cho nhiều part details',
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả cập nhật batch',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'array', items: { type: 'string' } },
        failed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  batchUpdateStatus(@Body() batchUpdateDto: BatchUpdatePartDetailStatusDto) {
    return this.partDetailService.batchUpdateStatus(batchUpdateDto);
  }

  @Patch(':id/default-location')
  @HasPermission(Permission.PART_DETAIL_UPDATE)
  @ApiOperation({ summary: 'Thiết lập vị trí mặc định cho part detail' })
  @ApiResponse({
    status: 200,
    description: 'Vị trí mặc định đã được thiết lập',
  })
  setDefaultLocation(
    @Param('id') id: string,
    @Body() body: { locationId?: string; jigDetailId?: string },
  ) {
    return this.partDetailService.setDefaultLocation(
      id,
      body.locationId,
      body.jigDetailId,
    );
  }

  @Patch(':id/restore-default')
  @HasPermission(Permission.PART_DETAIL_UPDATE)
  @ApiOperation({ summary: 'Khôi phục part detail về vị trí mặc định' })
  @ApiResponse({
    status: 200,
    description: 'Part detail đã được khôi phục về vị trí mặc định',
  })
  restoreToDefaultLocation(@Param('id') id: string) {
    return this.partDetailService.restoreToDefaultLocation(id);
  }
}
