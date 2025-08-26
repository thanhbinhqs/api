import { BaseEntity } from 'src/common/entities/base-entity';
import { Permission } from 'src/common/enums/permission.enum';
import { Column, Entity, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';
import { EncryptionService } from 'src/common/services/encryption.service';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_SYSTEM_SETTINGS } from '../../common/constants/system-settings.constants';
import type {
  ExternalSystemAuthInfo,
  ExternalSystemAuthNotification,
} from 'src/common/types/external-system-auth.types';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  employeeId?: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true, type: 'bytea', default: null })
  avatar?: Buffer; // base64 encoded image

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  birthday?: Date;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  lastLogin?: Date; // timestamp

  @Column({ nullable: true, type: 'timestamp with time zone' })
  changePasswordAt?: Date; // timestamp

  @Column({ type: 'uuid', default: () => 'gen_random_uuid()' })
  tokenVersion: string;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  lastFailedLogin?: Date;

  @Column({
    type: 'jsonb',
    default: [],
    nullable: true,
    transformer: {
      to: (value: Permission[]) => value,
      from: (value) => value || [],
    },
  })
  permissions: Permission[];

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @Column({
    type: 'jsonb',
    nullable: true,
    default: null,
  })
  externalInfo: any;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
    transformer: {
      to: (value: ExternalSystemAuthInfo) => {
        if (!value) return null;
        // Mã hóa dữ liệu trước khi lưu
        const encryptionService = new EncryptionService(new ConfigService(), {
          systemSettings: DEFAULT_SYSTEM_SETTINGS,
        });
        return encryptionService.encrypt(value);
      },
      from: (value: string) => {
        if (!value) return null;
        try {
          // Giải mã dữ liệu khi đọc
          const encryptionService = new EncryptionService(new ConfigService(), {
            systemSettings: DEFAULT_SYSTEM_SETTINGS,
          });
          return encryptionService.decrypt(value);
        } catch (error) {
          console.error('Failed to decrypt external system auth info:', error);
          return null;
        }
      },
    },
  })
  externalSystemAuthInfo: ExternalSystemAuthInfo;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: [],
    transformer: {
      to: (value: ExternalSystemAuthNotification[]) => value || [],
      from: (value) => value || [],
    },
  })
  externalSystemAuthNotifications: ExternalSystemAuthNotification[];
}
