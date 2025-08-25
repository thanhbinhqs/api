import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './entities/task.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';
import { Jig } from '../jig/entities/jig.entity';
import { JigDetail } from '../jig/entities/jig-detail.entity';
import { FileManagerModule } from '../file-manager/file-manager.module';
import { NotificationEventService } from '../common/services/notification-event.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      User,
      Role,
      Jig,
      JigDetail
    ]),
    FileManagerModule
  ],
  controllers: [TaskController],
  providers: [TaskService, NotificationEventService],
  exports: [TaskService]
})
export class TaskModule {}
