import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EncryptionService } from './common/services/encryption.service';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { SystemSettingsMiddleware } from './common/middlewares/system-settings.middleware';
import { RequestContextMiddleware } from './common/middlewares/request-context.middleware';
import { AuditLogModule } from './audit-log/audit-log.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { NotificationModule } from './notification/notification.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JigModule } from './jig/jig.module';
import { PartModule } from './part/part.module';
import { MetaModule } from './meta/meta.module';
import { TaskModule } from './task/task.module';
import { ApprovalModule } from './approval/approval.module';
import { ScheduleModule } from './schedule/schedule.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    SystemSettingsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        logging: configService.get('DB_LOGGING') === 'true',
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: createKeyv(configService.get('REDIS_URL')),
        ttl: 5000, // 5 seconds
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    AuditLogModule,
    FileManagerModule,
    NotificationModule,
    JigModule,
    PartModule,
    MetaModule,
    TaskModule,
    ApprovalModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService, EncryptionService, JwtService],
  exports: [JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, SystemSettingsMiddleware)
      .forRoutes('*path');
  }
}
