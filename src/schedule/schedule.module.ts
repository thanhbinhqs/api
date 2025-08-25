import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { TaskScheduleService } from './services/task-schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../task/entities/task.entity';
import { Jig } from '../jig/entities/jig.entity';
import { JigDetail } from '../jig/entities/jig-detail.entity';
import { User } from '../user/entities/user.entity';
import { NotificationEventService } from '../common/services/notification-event.service';

@Module({
  imports: [
    NestScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Task, Jig, JigDetail, User]),
  ],
  providers: [TaskScheduleService, NotificationEventService],
  exports: [TaskScheduleService],
})
export class ScheduleModule {}
