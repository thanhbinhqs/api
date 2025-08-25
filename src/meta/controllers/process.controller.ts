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
import { ProcessService } from '../services/process.service';
import { CreateProcessDto } from '../dto/process/create-process.dto';
import { UpdateProcessDto } from '../dto/process/update-process.dto';
import { ProcessFilterDto } from '../dto/process/process-filter.dto';
import { Process } from '../entities/process.entity';
import { PaginatedResult } from 'src/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';

@ApiTags('Processes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('processes')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post()
  @HasPermission(Permission.PROCESS_CREATE)
  @ApiOperation({ summary: 'Tạo process mới' })
  @ApiResponse({
    status: 201,
    description: 'Process đã được tạo thành công',
    type: Process,
  })
  async create(@Body() createProcessDto: CreateProcessDto): Promise<Process> {
    return this.processService.createProcess(createProcessDto);
  }

  @Get()
  @HasPermission(Permission.PROCESS_READ)
  @ApiOperation({ summary: 'Lấy danh sách processes với filter và phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách processes',
    type: PaginatedResult<Process>,
  })
  async findAll(@Query() filterDto: ProcessFilterDto): Promise<PaginatedResult<Process>> {
    return this.processService.findAllProcesses(filterDto);
  }

  @Get('simple')
  @HasPermission(Permission.PROCESS_READ)
  @ApiOperation({ summary: 'Lấy danh sách processes đơn giản' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách processes đơn giản',
    type: [Process],
  })
  async findAllSimple(): Promise<Process[]> {
    return this.processService.findAllProcessesSimple();
  }

  @Get('slug/:slug')
  @HasPermission(Permission.PROCESS_READ)
  @ApiOperation({ summary: 'Lấy process theo slug' })
  async findBySlug(@Param('slug') slug: string): Promise<Process> {
    const process = await this.processService.findProcessBySlug(slug);
    if (!process) {
      throw new NotFoundException(`Process với slug "${slug}" không tồn tại`);
    }
    return process;
  }

  @Get(':id')
  @HasPermission(Permission.PROCESS_READ)
  @ApiOperation({ summary: 'Lấy process theo ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Process> {
    const process = await this.processService.findProcessById(id);
    if (!process) {
      throw new NotFoundException(`Process với ID "${id}" không tồn tại`);
    }
    return process;
  }

  @Patch(':id')
  @HasPermission(Permission.PROCESS_UPDATE)
  @ApiOperation({ summary: 'Cập nhật process' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProcessDto: UpdateProcessDto,
  ): Promise<Process> {
    return this.processService.updateProcess(id, updateProcessDto);
  }

  @Delete(':id')
  @HasPermission(Permission.PROCESS_DELETE)
  @ApiOperation({ summary: 'Xóa process' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.processService.deleteProcess(id);
    return { message: 'Process đã được xóa thành công' };
  }
}
