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
import { LineService } from '../services/line.service';
import { CreateLineDto } from '../dto/line/create-line.dto';
import { UpdateLineDto } from '../dto/line/update-line.dto';
import { LineFilterDto } from '../dto/line/line-filter.dto';
import { Line } from '../entities/line.entity';
import { PaginatedResult } from 'src/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';

@ApiTags('Lines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lines')
export class LineController {
  constructor(private readonly lineService: LineService) {}

  @Post()
  @HasPermission(Permission.LINE_CREATE)
  @ApiOperation({ summary: 'Tạo line mới' })
  @ApiResponse({
    status: 201,
    description: 'Line đã được tạo thành công',
    type: Line,
  })
  @ApiResponse({
    status: 409,
    description: 'Line với tên hoặc slug đã tồn tại',
  })
  async create(@Body() createLineDto: CreateLineDto): Promise<Line> {
    return this.lineService.createLine(createLineDto);
  }

  @Get()
  @HasPermission(Permission.LINE_READ)
  @ApiOperation({ summary: 'Lấy danh sách lines với filter và phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lines',
    type: PaginatedResult<Line>,
  })
  async findAll(
    @Query() filterDto: LineFilterDto,
  ): Promise<PaginatedResult<Line>> {
    return this.lineService.findAllLines(filterDto);
  }

  @Get('simple')
  @HasPermission(Permission.LINE_READ)
  @ApiOperation({ summary: 'Lấy danh sách lines đơn giản không phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lines đơn giản',
    type: [Line],
  })
  async findAllSimple(): Promise<Line[]> {
    return this.lineService.findAllLinesSimple();
  }

  @Get('slug/:slug')
  @HasPermission(Permission.LINE_READ)
  @ApiOperation({ summary: 'Lấy line theo slug' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin line',
    type: Line,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy line',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Line> {
    const line = await this.lineService.findLineBySlug(slug);
    if (!line) {
      throw new NotFoundException(`Line với slug "${slug}" không tồn tại`);
    }
    return line;
  }

  @Get('zone/:zoneId')
  @HasPermission(Permission.LINE_READ)
  @ApiOperation({ summary: 'Lấy danh sách lines theo zone' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lines theo zone',
    type: [Line],
  })
  async findByZone(
    @Param('zoneId', ParseUUIDPipe) zoneId: string,
  ): Promise<Line[]> {
    return this.lineService.findLinesByZone(zoneId);
  }

  @Get(':id')
  @HasPermission(Permission.LINE_READ)
  @ApiOperation({ summary: 'Lấy line theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin line',
    type: Line,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy line',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Line> {
    const line = await this.lineService.findLineById(id);
    if (!line) {
      throw new NotFoundException(`Line với ID "${id}" không tồn tại`);
    }
    return line;
  }

  @Patch(':id')
  @HasPermission(Permission.LINE_UPDATE)
  @ApiOperation({ summary: 'Cập nhật line' })
  @ApiResponse({
    status: 200,
    description: 'Line đã được cập nhật thành công',
    type: Line,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy line',
  })
  @ApiResponse({
    status: 409,
    description: 'Line với tên hoặc slug đã tồn tại',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLineDto: UpdateLineDto,
  ): Promise<Line> {
    return this.lineService.updateLine(id, updateLineDto);
  }

  @Delete(':id')
  @HasPermission(Permission.LINE_DELETE)
  @ApiOperation({ summary: 'Xóa line' })
  @ApiResponse({
    status: 200,
    description: 'Line đã được xóa thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy line',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.lineService.deleteLine(id);
    return { message: 'Line đã được xóa thành công' };
  }
}
