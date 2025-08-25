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
  ) {}

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
        timestamp: new Date()
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
    const skip = (page - 1) * limit;
    const query = this.userRepository.createQueryBuilder('user');

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        //console.log(Object.entries(filter))
        if (
          value != undefined &&
          value != 'null' &&
          value != 'undefined' &&
          value != '' &&
          value != null
        ) {
          const trimmedValue = value.toString().trim();
          query.andWhere(`user.${key} ILIKE :${key}`, {
            [key]: `%${trimmedValue}%`,
          });
        }
      });
    }

    if (sort) {
      query.orderBy(`user.${sort.field}`, sort.order);
    }

    const queryStr = query.getQuery();
    const [users, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      total,
      page,
      limit,
      data: users.map((u) => new UserResponseDto(u)),
      totalPages: Math.ceil(total / limit),
    };
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
