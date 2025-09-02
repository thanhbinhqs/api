import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { EncryptionService } from '../common/services/encryption.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from 'src/common/enums/permission.enum';
import { UserResponseDto } from '../common/dto/user-response.dto';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { Utils } from 'src/common/services/utils';
import { v4 as uuidv4 } from 'uuid';
import { NotificationEventService } from '../common/services/notification-event.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @Inject(forwardRef(() => EncryptionService))
    private encryptionService: EncryptionService,
    private readonly notificationEventService: NotificationEventService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    let user = await this.userRepository.findOne({
      where: {
        username: createUserDto.username,
      },
    });
    if (user) throw new BadRequestException('Username already exists.');
    const hashedPassword = Utils.hashedPassword(createUserDto.password);
    user = this.userRepository.create({
      ...createUserDto,
      username: createUserDto.username.toLowerCase(),
      password: hashedPassword,
      isActive: true,
    });

    user = await this.userRepository.save(user);

    // Gửi thông báo user mới được tạo
    const currentUser = (this.request as any).user;
    if (currentUser) {
      this.notificationEventService.emitUserCreated({
        userId: user.id,
        username: user.username,
        message: `User mới được tạo: ${user.username}`,
        createdBy: currentUser.username,
        type: 'USER_CREATED',
        timestamp: new Date(),
      });
    }

    return new UserResponseDto(user);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    sort?: { field: string; order: 'ASC' | 'DESC' },
    filter?: Partial<User>,
  ): Promise<{
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // === VALIDATION VÀ CẤU HÌNH AN TOÀN ===

    //await new Promise((resolve) => setTimeout(resolve, 5000)); // Thêm độ trễ 5000ms để chống timing attack
    const safePage = this.validatePositiveNumber(page, 1);
    const safeLimit = this.validatePositiveNumber(limit, 10, 100);
    const skip = (safePage - 1) * safeLimit;

    const query = this.userRepository.createQueryBuilder('user');

    // === XỬ LÝ FILTER THEO TỪNG TRƯỜNG CỤ THỂ CỦA USER ENTITY ===
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (this.isValidFilterValue(value)) {
          this.applyUserFieldFilter(query, key as keyof User, value);
        }
      });
    }

    // === SORTING AN TOÀN ===
    this.applySafeUserSorting(query, sort);

    const [users, total] = await query
      .skip(skip)
      .take(safeLimit)
      .getManyAndCount();

    return {
      total,
      page: safePage,
      limit: safeLimit,
      data: users.map((u) => new UserResponseDto(u)),
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  // === HELPER METHODS CHO USER ENTITY ===

  private applyUserFieldFilter(
    query: any,
    field: keyof User,
    value: any,
  ): void {
    const trimmedValue = value.toString().trim();

    switch (field) {
      // STRING FIELDS - exact match hoặc ILIKE
      case 'username':
      case 'employeeId':
        if (trimmedValue) {
          query.andWhere(`user.${field} ILIKE :${field}`, {
            [field]: `%${trimmedValue}%`,
          });
        }
        break;

      // EMAIL FIELD - validation format
      case 'email':
        if (trimmedValue && this.isValidEmail(trimmedValue)) {
          query.andWhere(`user.${field} ILIKE :${field}`, {
            [field]: `%${trimmedValue}%`,
          });
        }
        break;

      // STRING FIELDS - full text search
      case 'fullName':
      case 'phone':
      case 'address':
        if (trimmedValue) {
          query.andWhere(`user.${field} ILIKE :${field}`, {
            [field]: `%${trimmedValue}%`,
          });
        }
        break;

      // BOOLEAN FIELDS
      case 'isActive':
      case 'isDeleted':
        const boolValue = this.parseBoolean(value);
        if (boolValue !== null) {
          query.andWhere(`user.${field} = :${field}`, { [field]: boolValue });
        }
        break;

      // NUMBER FIELDS
      case 'failedLoginAttempts':
        const numValue = this.parseNumber(value);
        if (numValue !== null) {
          query.andWhere(`user.${field} = :${field}`, { [field]: numValue });
        }
        break;

      // DATE FIELDS
      case 'birthday':
      case 'lastLogin':
      case 'changePasswordAt':
      case 'lastFailedLogin':
      case 'createdAt':
      case 'updatedAt':
        const dateValue = this.parseAndValidateDate(trimmedValue);
        if (dateValue) {
          // Filter by date range (same day)
          const startOfDay = new Date(dateValue);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(dateValue);
          endOfDay.setHours(23, 59, 59, 999);

          query.andWhere(
            `user.${field} BETWEEN :${field}Start AND :${field}End`,
            {
              [`${field}Start`]: startOfDay,
              [`${field}End`]: endOfDay,
            },
          );
        }
        break;

      // UUID FIELDS
      case 'id':
      case 'tokenVersion':
        if (this.isValidUUID(trimmedValue)) {
          query.andWhere(`user.${field} = :${field}`, {
            [field]: trimmedValue,
          });
        }
        break;

      // ARRAY FIELDS (permissions)
      case 'permissions':
        if (Array.isArray(value) && value.length > 0) {
          query.andWhere(`user.${field} @> :${field}`, { [field]: value });
        }
        break;

      // Ignore sensitive fields
      case 'password':
      case 'externalSystemAuthInfo':
        // Không cho phép filter theo các trường nhạy cảm
        break;

      default:
        // Các trường khác - generic string search
        if (trimmedValue) {
          query.andWhere(`user.${field} ILIKE :${field}`, {
            [field]: `%${trimmedValue}%`,
          });
        }
        break;
    }
  }

  private applySafeUserSorting(
    query: any,
    sort?: { field: string; order: 'ASC' | 'DESC' },
  ): void {
    const validSortFields: (keyof User)[] = [
      'id',
      'username',
      'email',
      'employeeId',
      'fullName',
      'phone',
      'isActive',
      'createdAt',
      'updatedAt',
      'lastLogin',
      'failedLoginAttempts',
    ];

    if (
      sort &&
      sort.field &&
      validSortFields.includes(sort.field as keyof User)
    ) {
      const safeOrder =
        sort.order === 'ASC' || sort.order === 'DESC' ? sort.order : 'DESC';
      query.orderBy(`user.${sort.field}`, safeOrder);
    } else {
      query.orderBy('user.createdAt', 'DESC');
    }
  }

  // === VALIDATION HELPERS ===

  private isValidFilterValue(value: any): boolean {
    return (
      value !== undefined &&
      value !== 'null' &&
      value !== 'undefined' &&
      value !== '' &&
      value !== null
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private parseAndValidateDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch (error) {
      return null;
    }
  }

  private parseBoolean(value: any): boolean | null {
    if (value === undefined || value === null) return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      if (['true', '1', 'yes', 'on'].includes(lowerValue)) return true;
      if (['false', '0', 'no', 'off'].includes(lowerValue)) return false;
    }
    if (typeof value === 'number') return value !== 0;
    return null;
  }

  private parseNumber(value: any): number | null {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  private validatePositiveNumber(
    value: any,
    defaultValue: number,
    maxValue?: number,
  ): number {
    const num = parseInt(value);
    if (isNaN(num) || num < 1) return defaultValue;
    return maxValue ? Math.min(num, maxValue) : num;
  }

  async findOne(
    id: string,
    options?: { relations: string[] },
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: options?.relations || [],
    });
    if (!user) throw new BadRequestException('User not found');
    return new UserResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    let user = await this.userRepository.findOne({
      where: { id: id, isDeleted: false },
    });
    if (!user) throw new BadRequestException('User not found');
    user = {
      ...user,
      ...updateUserDto,
      updatedAt: new Date(),
      updatedBy: this.request.user?.username || 'system',
    } as User;

    user = await this.userRepository.save({ ...user, ...updateUserDto });
    return new UserResponseDto(user);
  }

  async updateProfile(updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const id = this.request.user?.id;
    return this.update(id!, updateUserDto);
  }

  async remove(id: string): Promise<UserResponseDto> {
    let user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!user) throw new BadRequestException('User not found');
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.deletedBy = this.request.user?.username || 'system';
    user = await this.userRepository.save(user);
    user.tokenVersion = uuidv4().toString();
    return new UserResponseDto(user);
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username, isDeleted: false },
    });
  }

  async setActive(id: string, isActive: boolean): Promise<UserResponseDto> {
    let user = await this.userRepository.findOne({
      where: { id: id, isDeleted: false },
    });
    if (!user) throw new BadRequestException('User not found');
    user.isActive = isActive;
    user.updatedAt = new Date();
    user.updatedBy = this.request.user?.username || 'system';
    user.tokenVersion = uuidv4().toString();
    user = await this.userRepository.save(user);
    return new UserResponseDto(user);
  }

  async setRoles(id: string, roleIds: string[]): Promise<UserResponseDto> {
    let user = await this.userRepository.findOne({
      where: { id: id, isDeleted: false },
      relations: ['roles'],
    });
    if (!user) throw new BadRequestException('User not found');

    const resRoles = await this.roleRepository.find({
      where: {
        id: In(roleIds),
      },
    });

    if (resRoles.length !== roleIds.length)
      throw new BadRequestException('Some roles are invalid');

    user.roles = resRoles;
    user.updatedAt = new Date();
    user.updatedBy = this.request.user?.username || 'system';
    user.tokenVersion = uuidv4().toString();
    user = await this.userRepository.save(user);
    return new UserResponseDto(user);
  }

  async setPermission(
    id: string,
    permissions: Permission[],
  ): Promise<UserResponseDto> {
    let user = await this.userRepository.findOne({
      where: { id: id, isDeleted: false },
      relations: ['permissions'],
    });
    if (!user) throw new BadRequestException('User not found');

    if (!Object.values(Permission).every((p) => permissions.includes(p))) {
      throw new BadRequestException('Invalid request permission(s)');
    }

    user.permissions = permissions;
    user.updatedAt = new Date();
    user.updatedBy = this.request.user?.username || 'system';
    user.tokenVersion = uuidv4().toString();
    user = await this.userRepository.save(user);
    return new UserResponseDto(user);
  }

  async rollback(id: string): Promise<UserResponseDto> {
    let user = await this.userRepository.findOne({
      where: { id: id, isDeleted: false },
    });
    if (!user) throw new BadRequestException('User not found');
    if (!user.isDeleted) throw new BadRequestException('User is not deleted');
    user.isDeleted = false;
    user.updatedAt = new Date();
    user.updatedBy = this.request.user?.username || 'system';
    user.tokenVersion = uuidv4().toString();
    user = await this.userRepository.save(user);

    return new UserResponseDto(user);
  }

  async setPassword(id: string, password: string): Promise<UserResponseDto> {
    let user = await this.userRepository.findOne({
      where: { id: id, isDeleted: false },
    });

    if (!user) throw new BadRequestException('User not found');

    user.password = Utils.hashedPassword(password);
    user.updatedAt = new Date();
    user.updatedBy = this.request.user?.username || 'system';
    user.tokenVersion = uuidv4().toString();
    user = await this.userRepository.save(user);

    return new UserResponseDto(user);
  }

  async updateExternalInfo(id: string, data: any): Promise<UserResponseDto> {
    let user = await this.userRepository.findOne({
      where: { id: id, isDeleted: false },
    });
    if (!user) throw new BadRequestException('User not found');

    const encryptedData = this.encryptionService.encrypt(data);
    user.externalInfo = encryptedData;
    user.updatedAt = new Date();
    user.updatedBy = this.request.user?.username || 'system';
    user.tokenVersion = uuidv4().toString();
    user = await this.userRepository.save(user);

    return new UserResponseDto(user);
  }

  async changePassword(changePasswordDto: {
    userId: number;
    oldPassword: string;
    newPassword: string;
  }): Promise<UserResponseDto> {
    const id = this.request.user?.id;
    if (!id)
      throw new UnauthorizedException('Unauthorized to perform this action');
    let user = await this.userRepository.findOne({
      where: { id: id, isDeleted: false },
    });

    if (!user) throw new BadRequestException('User not found');
    if (!Utils.comparePassword(changePasswordDto.oldPassword, user.password))
      throw new BadRequestException('Old password does not match');

    user.password = Utils.hashedPassword(changePasswordDto.newPassword);
    user.updatedAt = new Date();
    user.updatedBy = this.request.user?.username || 'system';
    user.tokenVersion = uuidv4().toString();
    user = await this.userRepository.save(user);

    return new UserResponseDto(user);
  }

  async findUsersByRole(role: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('role.name = :role', { role })
      .andWhere('user.isDeleted = false')
      .andWhere('user.isActive = true')
      .getMany();
  }

  async findUsersByPermission(permission: Permission): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.permissions @> :permission', { permission: [permission] })
      .andWhere('user.isDeleted = false')
      .andWhere('user.isActive = true')
      .getMany();
  }
}
