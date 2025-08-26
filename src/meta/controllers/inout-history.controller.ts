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
} from '@nestjs/swagger';
import { InOutHistoryService } from '../services/inout-history.service';
import { CreateInOutHistoryDto } from '../dto/inout-history/create-inout-history.dto';
import { UpdateInOutHistoryDto } from '../dto/inout-history/update-inout-history.dto';
import { InOutHistoryFilterDto } from '../dto/inout-history/inout-history-filter.dto';
import { InOutHistory } from '../entities/inout-history.entity';
import { PaginatedResult } from 'src/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';

@ApiTags('InOut Histories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inout-histories')
export class InOutHistoryController {
  constructor(private readonly inOutHistoryService: InOutHistoryService) {}

  @Post()
  @HasPermission(Permission.INOUT_HISTORY_CREATE)
  @ApiOperation({ summary: 'Tạo lịch sử nhập/xuất mới' })
  @ApiResponse({
    status: 201,
    description: 'Lịch sử nhập/xuất đã được tạo thành công',
    type: InOutHistory,
  })
  async create(
    @Body() createInOutHistoryDto: CreateInOutHistoryDto,
  ): Promise<InOutHistory> {
    return this.inOutHistoryService.createInOutHistory(createInOutHistoryDto);
  }

  @Get()
  @HasPermission(Permission.INOUT_HISTORY_READ)
  @ApiOperation({
    summary: 'Lấy danh sách lịch sử nhập/xuất với filter và phân trang',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lịch sử nhập/xuất',
    type: PaginatedResult<InOutHistory>,
  })
  async findAll(
    @Query() filterDto: InOutHistoryFilterDto,
  ): Promise<PaginatedResult<InOutHistory>> {
    return this.inOutHistoryService.findAllInOutHistories(filterDto);
  }

  @Get('simple')
  @HasPermission(Permission.INOUT_HISTORY_READ)
  @ApiOperation({ summary: 'Lấy danh sách lịch sử nhập/xuất đơn giản' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lịch sử nhập/xuất đơn giản',
    type: [InOutHistory],
  })
  async findAllSimple(): Promise<InOutHistory[]> {
    return this.inOutHistoryService.findAllInOutHistoriesSimple();
  }

  @Get('inventory-report')
  @HasPermission(Permission.INOUT_HISTORY_READ)
  @ApiOperation({ summary: 'Lấy báo cáo tồn kho' })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo tồn kho',
  })
  async getInventoryReport(@Query('partId') partId?: string): Promise<any> {
    return this.inOutHistoryService.getInventoryReport(partId);
  }

  @Get('part/:partId')
  @HasPermission(Permission.INOUT_HISTORY_READ)
  @ApiOperation({ summary: 'Lấy lịch sử nhập/xuất theo part' })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử nhập/xuất theo part',
    type: [InOutHistory],
  })
  async getHistoryByPart(
    @Param('partId', ParseUUIDPipe) partId: string,
  ): Promise<InOutHistory[]> {
    return this.inOutHistoryService.getHistoryByPart(partId);
  }

  @Get('part-detail/:partDetailId')
  @HasPermission(Permission.INOUT_HISTORY_READ)
  @ApiOperation({ summary: 'Lấy lịch sử nhập/xuất theo part detail' })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử nhập/xuất theo part detail',
    type: [InOutHistory],
  })
  async getHistoryByPartDetail(
    @Param('partDetailId', ParseUUIDPipe) partDetailId: string,
  ): Promise<InOutHistory[]> {
    return this.inOutHistoryService.getHistoryByPartDetail(partDetailId);
  }

  @Get(':id')
  @HasPermission(Permission.INOUT_HISTORY_READ)
  @ApiOperation({ summary: 'Lấy lịch sử nhập/xuất theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin lịch sử nhập/xuất',
    type: InOutHistory,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<InOutHistory> {
    const inOutHistory =
      await this.inOutHistoryService.findInOutHistoryById(id);
    if (!inOutHistory) {
      throw new NotFoundException(
        `Lịch sử nhập/xuất với ID "${id}" không tồn tại`,
      );
    }
    return inOutHistory;
  }

  @Patch(':id')
  @HasPermission(Permission.INOUT_HISTORY_UPDATE)
  @ApiOperation({ summary: 'Cập nhật lịch sử nhập/xuất' })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử nhập/xuất đã được cập nhật thành công',
    type: InOutHistory,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInOutHistoryDto: UpdateInOutHistoryDto,
  ): Promise<InOutHistory> {
    return this.inOutHistoryService.updateInOutHistory(
      id,
      updateInOutHistoryDto,
    );
  }

  @Delete(':id')
  @HasPermission(Permission.INOUT_HISTORY_DELETE)
  @ApiOperation({ summary: 'Xóa lịch sử nhập/xuất' })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử nhập/xuất đã được xóa thành công',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.inOutHistoryService.deleteInOutHistory(id);
    return { message: 'Lịch sử nhập/xuất đã được xóa thành công' };
  }
}
