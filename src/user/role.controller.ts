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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { HasPermission } from '../common/decorators/has-permission.decorator';
import { Permission } from '../common/enums/permission.enum';
import { UuidValidationPipe } from 'src/common/pipes/uuid-validation.pipe';
import { PaginationDto, SortDto } from '../common/dto/pagination.dto';
import { RoleFilterDto } from './dto/role-filter.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RequireAuth } from 'src/common/decorators/jwt-auth.decorator';

@ApiTags('role')
@Controller('role')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  @HasPermission(Permission.ROLE_CREATE)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  @Get()
  @HasPermission(Permission.ROLE_READ)
  findAll(
    @Query() pagination: PaginationDto,
    @Query() sort: SortDto,
    @Query() filter: RoleFilterDto,
  ) {
    return this.roleService.findAll(
      pagination.page,
      pagination.limit,
      sort.sortBy && sort.sortOrder
        ? { field: sort.sortBy, order: sort.sortOrder }
        : undefined,
      filter,
    );
  }

  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role found' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @Get(':id')
  @HasPermission(Permission.ROLE_READ)
  findOne(@Param('id', UuidValidationPipe) id: string) {
    return this.roleService.findOne(id);
  }

  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @Patch(':id')
  @HasPermission(Permission.ROLE_UPDATE)
  update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @Delete(':id')
  @HasPermission(Permission.ROLE_DELETE)
  remove(@Param('id', UuidValidationPipe) id: string) {
    return this.roleService.remove(id);
  }
}
