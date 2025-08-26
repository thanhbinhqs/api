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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JigService } from './jig.service';
import { CreateJigDto } from './dto/create-jig.dto';
import { UpdateJigDto } from './dto/update-jig.dto';
import { JigFilterDto } from './dto/jig-filter.dto';
import { Jig } from './entities/jig.entity';
import { PaginatedResult } from 'src/common/dto/paginated-result.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';

@ApiTags('Jigs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jigs')
export class JigController {
  constructor(private readonly jigService: JigService) {}

  @Post()
  @HasPermission(Permission.JIG_CREATE)
  @ApiOperation({ summary: 'Tạo jig mới' })
  @ApiResponse({
    status: 201,
    description: 'Jig đã được tạo thành công',
    type: Jig,
  })
  async create(@Body() createJigDto: CreateJigDto): Promise<Jig> {
    return await this.jigService.create(createJigDto);
  }

  @Get()
  @HasPermission(Permission.JIG_READ)
  @ApiOperation({ summary: 'Lấy danh sách jigs' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách jigs',
    type: PaginatedResult,
  })
  async findAll(
    @Query() filterDto: JigFilterDto,
  ): Promise<PaginatedResult<Jig>> {
    return await this.jigService.findAll(filterDto);
  }

  @Get('by-code/:code')
  @HasPermission(Permission.JIG_READ)
  @ApiOperation({ summary: 'Lấy jig theo code' })
  @ApiResponse({ status: 200, description: 'Thông tin jig', type: Jig })
  async findByCode(@Param('code') code: string): Promise<Jig> {
    const jig = await this.jigService.findByCode(code);
    if (!jig) {
      throw new NotFoundException(`Không tìm thấy jig với code ${code}`);
    }
    return jig;
  }

  @Get('by-mes-code/:mesCode')
  @HasPermission(Permission.JIG_READ)
  @ApiOperation({ summary: 'Lấy jig theo MES code' })
  @ApiResponse({ status: 200, description: 'Thông tin jig', type: Jig })
  async findByMesCode(@Param('mesCode') mesCode: string): Promise<Jig> {
    const jig = await this.jigService.findByMesCode(mesCode);
    if (!jig) {
      throw new NotFoundException(`Không tìm thấy jig với MES code ${mesCode}`);
    }
    return jig;
  }

  @Get('maintenance/needed')
  @HasPermission(Permission.JIG_READ)
  @ApiOperation({ summary: 'Lấy danh sách jigs cần bảo trì' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách jigs cần bảo trì',
    type: [Jig],
  })
  async getJigsNeedingMaintenance(): Promise<Jig[]> {
    return await this.jigService.getJigsNeedingMaintenance();
  }

  @Get(':id')
  @HasPermission(Permission.JIG_READ)
  @ApiOperation({ summary: 'Lấy thông tin jig theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin jig', type: Jig })
  async findOne(@Param('id') id: string): Promise<Jig> {
    return await this.jigService.findOne(id);
  }

  @Patch(':id')
  @HasPermission(Permission.JIG_UPDATE)
  @ApiOperation({ summary: 'Cập nhật jig' })
  @ApiResponse({ status: 200, description: 'Jig đã được cập nhật', type: Jig })
  async update(
    @Param('id') id: string,
    @Body() updateJigDto: UpdateJigDto,
  ): Promise<Jig> {
    return await this.jigService.update(id, updateJigDto);
  }

  @Delete(':id')
  @HasPermission(Permission.JIG_DELETE)
  @ApiOperation({ summary: 'Xóa jig' })
  @ApiResponse({ status: 200, description: 'Jig đã được xóa' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.jigService.remove(id);
    return { message: 'Jig đã được xóa thành công' };
  }
}
