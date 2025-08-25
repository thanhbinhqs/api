import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFile } from './entities/file.entity';
import { FileShare } from './entities/file-share.entity';
import { FileRepository } from './repositories/file.repository';
import { FileShareRepository } from './repositories/file-share.repository';
import { FileManagerService } from './file-manager.service';
import { FileManagerController } from './file-manager.controller';
import { UserModule } from '../user/user.module';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadFile, FileShare]),
    UserModule
  ],
  providers: [
    FileManagerService,
    {
      provide: FileRepository,
      useFactory: (dataSource: DataSource) => new FileRepository(dataSource),
      inject: [DataSource],
    },
    {
      provide: FileShareRepository,
      useFactory: (dataSource: DataSource) => new FileShareRepository(dataSource),
      inject: [DataSource],
    }
  ],
  controllers: [FileManagerController],
  exports: [FileManagerService]
})
export class FileManagerModule {}
