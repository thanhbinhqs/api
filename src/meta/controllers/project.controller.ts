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
import { ProjectService } from '../services/project.service';
import { CreateProjectDto } from '../dto/project/create-project.dto';
import { UpdateProjectDto } from '../dto/project/update-project.dto';
import { ProjectFilterDto } from '../dto/project/project-filter.dto';
import { Project } from '../entities/project.entity';
import { PaginatedResult } from 'src/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HasPermission(Permission.PROJECT_CREATE)
  @ApiOperation({ summary: 'Tạo project mới' })
  @ApiResponse({
    status: 201,
    description: 'Project đã được tạo thành công',
    type: Project,
  })
  async create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectService.createProject(createProjectDto);
  }

  @Get()
  @HasPermission(Permission.PROJECT_READ)
  @ApiOperation({ summary: 'Lấy danh sách projects với filter và phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách projects',
    type: PaginatedResult<Project>,
  })
  async findAll(@Query() filterDto: ProjectFilterDto): Promise<PaginatedResult<Project>> {
    return this.projectService.findAllProjects(filterDto);
  }

  @Get('simple')
  @HasPermission(Permission.PROJECT_READ)
  @ApiOperation({ summary: 'Lấy danh sách projects đơn giản' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách projects đơn giản',
    type: [Project],
  })
  async findAllSimple(): Promise<Project[]> {
    return this.projectService.findAllProjectsSimple();
  }

  @Get('slug/:slug')
  @HasPermission(Permission.PROJECT_READ)
  @ApiOperation({ summary: 'Lấy project theo slug' })
  async findBySlug(@Param('slug') slug: string): Promise<Project> {
    const project = await this.projectService.findProjectBySlug(slug);
    if (!project) {
      throw new NotFoundException(`Project với slug "${slug}" không tồn tại`);
    }
    return project;
  }

  @Get(':id')
  @HasPermission(Permission.PROJECT_READ)
  @ApiOperation({ summary: 'Lấy project theo ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Project> {
    const project = await this.projectService.findProjectById(id);
    if (!project) {
      throw new NotFoundException(`Project với ID "${id}" không tồn tại`);
    }
    return project;
  }

  @Patch(':id')
  @HasPermission(Permission.PROJECT_UPDATE)
  @ApiOperation({ summary: 'Cập nhật project' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectService.updateProject(id, updateProjectDto);
  }

  @Delete(':id')
  @HasPermission(Permission.PROJECT_DELETE)
  @ApiOperation({ summary: 'Xóa project' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.projectService.deleteProject(id);
    return { message: 'Project đã được xóa thành công' };
  }
}
