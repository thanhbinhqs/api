import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PermissionController } from './permission.controller';
import { RoleController } from './role.controller';
import { SeedController } from './seed.controller';
import { RoleService } from './role.service';
import { ExternalSystemAuthService } from './external-system-auth.service';
import { ExternalSystemAuthController } from './external-system-auth.controller';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { EncryptionService } from '../common/services/encryption.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationEventService } from '../common/services/notification-event.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Role, User]), JwtModule],
  controllers: [
    UserController,
    PermissionController,
    RoleController,
    SeedController,
    ExternalSystemAuthController,
  ],
  providers: [
    UserService,
    RoleService,
    ExternalSystemAuthService,
    EncryptionService,
    JwtAuthGuard,
    NotificationEventService,
  ],
  exports: [UserService, TypeOrmModule.forFeature([User]), JwtAuthGuard],
})
export class UserModule {}
