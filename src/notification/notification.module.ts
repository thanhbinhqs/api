import { Module, forwardRef } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { NotificationIntegrationService } from './notification-integration.service';
import { NotificationListener } from './notification.listener';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { NotificationEventService } from '../common/services/notification-event.service';

@Module({
  imports: [forwardRef(() => UserModule), JwtModule, TypeOrmModule.forFeature([User])],
  providers: [
    NotificationGateway, 
    NotificationService, 
    NotificationIntegrationService,
    NotificationListener,
    NotificationEventService
  ],
  exports: [
    NotificationService, 
    NotificationIntegrationService,
    NotificationEventService
  ],
})
export class NotificationModule {}
