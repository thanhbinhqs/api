import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../common/entities/audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogSubscriber } from '../common/subscribers/audit-log.subscriber';
import { DataSource } from 'typeorm';
import { AuditLogController } from './audit-log.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), UserModule],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    {
      provide: AuditLogSubscriber,
      useFactory: (dataSource: DataSource) =>
        new AuditLogSubscriber(dataSource),
      inject: [DataSource],
    },
  ],
  exports: [AuditLogService],
})
export class AuditLogModule {}
