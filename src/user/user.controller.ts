import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { UuidValidationPipe } from '../common/pipes/uuid-validation.pipe';
import { PaginationDto, SortDto } from '../common/dto/pagination.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequireAuth } from 'src/common/decorators/jwt-auth.decorator';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';
import type { Request } from 'express';
import { SetActiveDto } from './dto/set-active.dto';
import { SetRoleDto } from './dto/set-role.dto';
import { SetPermissionDto } from './dto/set-permission.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateExternalInfoDto } from './dto/update-external-info.dto';

@ApiTags('user')
@Controller('user')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  @HasPermission(Permission.USER_CREATE)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }


  @ApiOperation({ summary: 'Get current user info' })
  @Get('me')
  getCurrentUser(@Req() req: Request) {
    const userId = (req.user as any)?.id;
    return this.userService.findOne(userId);
  }

  @ApiOperation({ summary: 'Update Profile' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch('profile')
  updateProfile(
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(updateUserDto);
  }


  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @Get()
  @HasPermission(Permission.USER_READ)
  findAll(
    @Query(new ValidationPipe({ transform: true })) pagination?: PaginationDto,
    @Query(new ValidationPipe({ transform: true })) sort?: SortDto,
    @Query(new ValidationPipe({ transform: true })) filter?: UserFilterDto,
  ) {
    return this.userService.findAll(
      pagination?.page,
      pagination?.limit,
      sort?.sortBy && sort?.sortOrder
        ? { field: sort.sortBy, order: sort.sortOrder }
        : undefined,
      filter,
    );
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  @HasPermission(Permission.USER_READ)
  findOne(@Param('id', UuidValidationPipe) id: string) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch(':id')
  @HasPermission(Permission.USER_UPDATE)
  update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }


  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  @HasPermission(Permission.USER_DELETE)
  remove(@Param('id', UuidValidationPipe) id: string) {
    return this.userService.remove(id);
  }

  @ApiOperation({ summary: 'Set user active status' })
  @Patch(':id/active')
  @HasPermission(Permission.USER_UPDATE)
  @ApiBody({ type: SetActiveDto })
  @UsePipes(new ValidationPipe())
  setActive(
    @Param('id', UuidValidationPipe) id: string,
    @Body() setActiveDto: SetActiveDto,
  ) {
    return this.userService.setActive(id, setActiveDto.isActive);
  }

  @ApiOperation({ summary: 'Set user roles' })
  @Patch(':id/role')
  @HasPermission(Permission.USER_SET_ROLE)
  @ApiBody({ type: SetRoleDto })
  @UsePipes(new ValidationPipe())
  setRoles(
    @Param('id', UuidValidationPipe) id: string,
    @Body() setRoleDto: SetRoleDto,
  ) {
    return this.userService.setRoles(id, setRoleDto.roleIds);
  }

  @ApiOperation({ summary: 'Set user permissions' })
  @Patch(':id/permission')
  @HasPermission(Permission.USER_SET_PERMISSIONS)
  @ApiBody({ type: SetPermissionDto })
  @UsePipes(new ValidationPipe())
  setPermission(
    @Param('id', UuidValidationPipe) id: string,
    @Body() setPermissionDto: SetPermissionDto,
  ) {
    return this.userService.setPermission(id, setPermissionDto.permissions);
  }

  @ApiOperation({ summary: 'Rollback user changes' })
  @Patch(':id/rollback')
  @HasPermission(Permission.USER_UPDATE)
  rollback(@Param('id', UuidValidationPipe) id: string) {
    return this.userService.rollback(id);
  }

  @ApiOperation({ summary: 'Set user password' })
  @Patch(':id/password')
  @HasPermission(Permission.USER_SET_PASSWORD)
  @ApiBody({ type: SetPasswordDto })
  @UsePipes(new ValidationPipe())
  setPassword(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: SetPasswordDto,
  ) {
    return this.userService.setPassword(id, body.password);
  }

  @ApiOperation({ summary: 'Change user password' })
  @Patch('change-password')
  @HasPermission(Permission.USER_SET_PASSWORD)
  @ApiBody({ type: ChangePasswordDto })
  @UsePipes(new ValidationPipe())
  changePassword(@Req() req: Request, @Body() body: ChangePasswordDto) {
    const userId = (req.user as any)?.id; // Get userId from JWT token
    return this.userService.changePassword({
      userId,
      oldPassword: body.oldPassword,
      newPassword: body.newPassword,
    });
  }



  @ApiOperation({ summary: 'Update user external info' })
  @Patch(':id/external-info')
  @HasPermission(Permission.USER_UPDATE)
  @ApiBody({ type: UpdateExternalInfoDto })
  @UsePipes(new ValidationPipe())
  updateExternalInfo(
    @Param('id', UuidValidationPipe) id: string,
    @Body() updateExternalInfoDto: UpdateExternalInfoDto,
  ) {
    return this.userService.updateExternalInfo(id, updateExternalInfoDto.data);
  }
}
