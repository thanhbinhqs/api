import { Permission } from 'src/common/enums/permission.enum';
import { Role } from '../../user/entities/role.entity';
import { User } from 'src/user/entities/user.entity';

export class UserResponseDto {
  id: string;
  username: string;
  email?: string;
  employeeId?: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  birthday?: Date;
  address?: string;
  lastLogin?: Date;
  permissions: Permission[];
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
  deletedBy: string;
  version: string;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.employeeId = user.employeeId;
    this.fullName = user.fullName;
    this.avatar = user.avatar?.toString('base64');
    this.phone = user.phone;
    this.birthday = user.birthday;
    this.address = user.address;
    this.lastLogin = user.lastLogin;
    this.permissions = user.permissions;
    this.roles = user.roles;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.deletedAt = user.deletedAt;
    this.isActive = user.isActive;
    this.isDeleted = user.isDeleted;
    this.createdBy = user.createdBy;
    this.updatedBy = user.updatedBy;
    this.deletedBy = user.deletedBy;
    this.version = user.version;
  }
}
