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
  Request,
  ParseUUIDPipe,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateRichTaskDto } from './dto/create-rich-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import {
  AttachFilesToTaskDto,
  UpdateTaskAttachmentsDto,
} from './dto/task-attachments.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { HasPermission } from '../common/decorators/has-permission.decorator';
import { Permission } from '../common/enums/permission.enum';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_CREATE)
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return await this.taskService.create(createTaskDto, req.user.id);
  }

  @Post('rich')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_CREATE)
  async createRichTask(
    @Body() createRichTaskDto: CreateRichTaskDto,
    @Request() req,
  ) {
    return await this.taskService.createRichTask(
      createRichTaskDto,
      req.user.id,
    );
  }

  @Get()
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_READ)
  async findAll(@Query() filterDto: TaskFilterDto) {
    return await this.taskService.findAll(filterDto);
  }

  @Get('statistics')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_READ)
  async getStatistics(@Request() req, @Query('userId') userId?: string) {
    // Chỉ admin mới có thể xem thống kê của user khác
    const targetUserId =
      userId && req.user.permissions?.includes(Permission.TASK_MANAGE_ALL)
        ? userId
        : req.user.id;

    return await this.taskService.getTaskStatistics(targetUserId);
  }

  @Get('upcoming')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_READ)
  async getUpcomingTasks(
    @Request() req,
    @Query('days') days?: string,
    @Query('userId') userId?: string,
  ) {
    const daysNumber = days ? parseInt(days) : 7;
    const targetUserId =
      userId && req.user.permissions?.includes(Permission.TASK_MANAGE_ALL)
        ? userId
        : req.user.id;

    return await this.taskService.getUpcomingTasks(daysNumber, targetUserId);
  }

  @Get('my-tasks')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_READ)
  async getMyTasks(@Request() req, @Query() filterDto: TaskFilterDto) {
    // Tự động filter theo user hiện tại
    const myFilterDto = {
      ...filterDto,
      assignedUserId: req.user.id,
    };
    return await this.taskService.findAll(myFilterDto);
  }

  @Get(':id')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_READ)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.taskService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return await this.taskService.update(id, updateTaskDto);
  }

  @Post(':id/assign')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_ASSIGN)
  @HttpCode(HttpStatus.OK)
  async assignTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId', ParseUUIDPipe) userId: string,
  ) {
    return await this.taskService.assignTask(id, userId);
  }

  @Post(':id/assign-to-me')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_READ)
  @HttpCode(HttpStatus.OK)
  async assignToMe(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return await this.taskService.assignTask(id, req.user.id);
  }

  @Post(':id/complete')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_UPDATE)
  @HttpCode(HttpStatus.OK)
  async completeTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    completeData: {
      completionNotes?: string;
      checklist?: any[];
    },
  ) {
    return await this.taskService.completeTask(
      id,
      completeData.completionNotes,
      completeData.checklist,
    );
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.taskService.remove(id);
  }

  // File attachment endpoints
  @Post(':id/attach-files')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_UPDATE)
  async attachFiles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() attachFilesDto: AttachFilesToTaskDto,
    @Request() req,
  ) {
    return await this.taskService.attachFilesToTask(
      id,
      attachFilesDto,
      req.user.id,
    );
  }

  @Get(':id/attachments')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_READ)
  async getTaskAttachments(@Param('id', ParseUUIDPipe) id: string) {
    return await this.taskService.getTaskAttachments(id);
  }

  @Get(':id/attachments/category/:category')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_READ)
  async getAttachmentsByCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('category') category: string,
  ) {
    return await this.taskService.getTaskAttachmentsByCategory(id, category);
  }

  @Patch(':id/attachments')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_UPDATE)
  async updateAttachments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTaskAttachmentsDto,
  ) {
    return await this.taskService.updateTaskAttachments(id, updateDto);
  }

  @Delete(':id/attachments/:attachmentId')
  @UseGuards(PermissionGuard)
  @HasPermission(Permission.TASK_UPDATE)
  async removeAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    await this.taskService.removeAttachmentFromTask(id, attachmentId);
    return { message: 'Đã xóa file đính kèm thành công' };
  }
}
