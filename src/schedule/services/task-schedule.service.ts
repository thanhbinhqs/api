import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, Between } from 'typeorm';
import { Task } from '../../task/entities/task.entity';
import { Jig } from '../../jig/entities/jig.entity';
import { JigDetail } from '../../jig/entities/jig-detail.entity';
import { User } from '../../user/entities/user.entity';
import {
  TaskType,
  TaskStatus,
  TaskPriority,
  AssigneeType,
} from '../../task/entities/task.entity';
import { NotificationEventService } from '../../common/services/notification-event.service';
import { NOTIFICATION_EVENTS } from '../../common/constants/notification-events';

@Injectable()
export class TaskScheduleService {
  private readonly logger = new Logger(TaskScheduleService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Jig)
    private readonly jigRepository: Repository<Jig>,
    @InjectRepository(JigDetail)
    private readonly jigDetailRepository: Repository<JigDetail>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationEventService: NotificationEventService,
  ) {}

  /**
   * Tự động tạo task bảo trì cho jigs
   * Chạy hàng ngày lúc 00:00
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async createMaintenanceTasks(): Promise<void> {
    this.logger.log('Bắt đầu tạo maintenance tasks tự động...');

    try {
      // Lấy tất cả jigs cần bảo trì
      const jigs = await this.jigRepository.find({
        where: { needMaintenance: true },
        relations: ['details'],
      });

      for (const jig of jigs) {
        await this.createMaintenanceTaskForJig(jig);
      }

      // Tạo task maintenance cho jig details
      await this.createMaintenanceTasksForJigDetails();

      this.logger.log('Hoàn thành tạo maintenance tasks tự động');
    } catch (error) {
      this.logger.error('Lỗi khi tạo maintenance tasks:', error);
    }
  }

  /**
   * Cập nhật status các task quá hạn
   * Chạy mỗi giờ
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updateOverdueTasks(): Promise<void> {
    this.logger.log('Bắt đầu cập nhật status các task quá hạn...');

    try {
      const now = new Date();

      // Tìm các task quá hạn trước khi update
      const overdueTasks = await this.taskRepository.find({
        where: {
          scheduledEndDate: LessThan(now),
          status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
        },
        relations: [
          'assignedUsers',
          'assignedRoles',
          'taskCreatedBy',
          'executedBy',
        ],
      });

      if (overdueTasks.length > 0) {
        // Cập nhật status
        await this.taskRepository.update(
          {
            scheduledEndDate: LessThan(now),
            status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
          },
          {
            status: TaskStatus.OVERDUE,
          },
        );

        // Gửi thông báo cho các task quá hạn
        for (const task of overdueTasks) {
          await this.sendOverdueNotification(task);
        }

        this.logger.log(`Đã cập nhật ${overdueTasks.length} task quá hạn`);
      } else {
        this.logger.log('Không có task quá hạn nào cần cập nhật');
      }
    } catch (error) {
      this.logger.error('Lỗi khi cập nhật status các task quá hạn:', error);
    }
  }

  /**
   * Kiểm tra và thông báo task sắp đến hạn
   * Chạy hàng ngày lúc 9h sáng
   */
  @Cron('0 9 * * *')
  async notifyUpcomingTasks(): Promise<void> {
    this.logger.log('Bắt đầu kiểm tra và thông báo task sắp đến hạn...');

    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const upcomingTasks = await this.taskRepository.find({
        where: {
          scheduledEndDate: Between(now, tomorrow),
          status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
        },
        relations: [
          'assignedUsers',
          'assignedRoles',
          'taskCreatedBy',
          'executedBy',
        ],
      });

      for (const task of upcomingTasks) {
        await this.sendUpcomingTaskNotification(task);
      }

      this.logger.log(
        `Đã gửi thông báo cho ${upcomingTasks.length} task sắp đến hạn`,
      );
    } catch (error) {
      this.logger.error('Lỗi khi thông báo task sắp đến hạn:', error);
    }
  }

  /**
   * Tạo maintenance task cho một jig cụ thể
   */
  private async createMaintenanceTaskForJig(jig: Jig): Promise<void> {
    // Kiểm tra xem có task maintenance pending nào cho jig này không
    const existingTask = await this.taskRepository.findOne({
      where: {
        relatedJig: { id: jig.id },
        type: TaskType.MAINTENANCE,
        status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
      },
    });

    if (existingTask) {
      return; // Đã có task maintenance, skip
    }

    // Tạo task maintenance cho jig
    const maintenanceDate = new Date();
    maintenanceDate.setDate(
      maintenanceDate.getDate() + jig.maintenanceInterval,
    );

    const adminUser = await this.getAdminUser();
    if (!adminUser) {
      this.logger.warn('Không tìm thấy admin user để tạo maintenance task');
      return;
    }

    const maintenanceTask = this.taskRepository.create({
      title: `Bảo trì định kỳ ${jig.name}`,
      description: `Bảo trì định kỳ cho jig ${jig.name} (${jig.code})`,
      type: TaskType.MAINTENANCE,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      assigneeType: AssigneeType.ROLE,
      taskCreatedBy: adminUser,
      scheduledStartDate: maintenanceDate,
      scheduledEndDate: new Date(
        maintenanceDate.getTime() + 4 * 60 * 60 * 1000,
      ), // 4 giờ
      estimatedDuration: 240, // 4 giờ
      relatedJig: jig,
      isRecurring: true,
      recurringInterval: jig.maintenanceInterval,
      tags: ['maintenance', 'auto-generated'],
    });

    await this.taskRepository.save(maintenanceTask);
    this.logger.log(`Đã tạo maintenance task cho jig ${jig.name}`);
  }

  /**
   * Tạo maintenance tasks cho jig details
   */
  private async createMaintenanceTasksForJigDetails(): Promise<void> {
    const jigDetails = await this.jigDetailRepository.find({
      relations: ['jig'],
      where: {
        jig: { needMaintenance: true },
      },
    });

    for (const jigDetail of jigDetails) {
      // Kiểm tra lần bảo trì cuối
      const daysSinceLastMaintenance = jigDetail.lastMaintenanceDate
        ? Math.floor(
            (Date.now() - jigDetail.lastMaintenanceDate.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : jigDetail.jig.maintenanceInterval + 1; // Nếu chưa bảo trì lần nào thì coi như đã quá hạn

      if (daysSinceLastMaintenance < jigDetail.jig.maintenanceInterval) {
        continue; // Chưa đến thời gian bảo trì
      }

      // Kiểm tra task maintenance pending
      const existingDetailTask = await this.taskRepository.findOne({
        where: {
          relatedJigDetail: { id: jigDetail.id },
          type: TaskType.MAINTENANCE,
          status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
        },
      });

      if (existingDetailTask) {
        continue;
      }

      const adminUser = await this.getAdminUser();
      if (!adminUser) {
        continue;
      }

      const detailMaintenanceTask = this.taskRepository.create({
        title: `Bảo trì ${jigDetail.jig.name} - ${jigDetail.code}`,
        description: `Bảo trì định kỳ cho jig detail ${jigDetail.code}`,
        type: TaskType.MAINTENANCE,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        assigneeType: AssigneeType.ROLE,
        taskCreatedBy: adminUser,
        scheduledStartDate: new Date(),
        scheduledEndDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 giờ
        estimatedDuration: 120, // 2 giờ
        relatedJigDetail: jigDetail,
        tags: ['maintenance', 'auto-generated', 'detail'],
      });

      await this.taskRepository.save(detailMaintenanceTask);
      this.logger.log(
        `Đã tạo maintenance task cho jig detail ${jigDetail.code}`,
      );
    }
  }

  /**
   * Gửi thông báo cho task quá hạn
   */
  private async sendOverdueNotification(task: Task): Promise<void> {
    try {
      this.notificationEventService.emitTaskOverdue({
        task: task,
        message: `Task quá hạn: ${task.title}`,
        taskId: task.id,
        title: task.title,
        scheduledEndDate: task.scheduledEndDate,
        type: NOTIFICATION_EVENTS.TASK_OVERDUE,
        priority: 'high',
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Lỗi khi gửi thông báo task quá hạn ${task.id}:`,
        error,
      );
    }
  }

  /**
   * Gửi thông báo cho task sắp đến hạn
   */
  private async sendUpcomingTaskNotification(task: Task): Promise<void> {
    try {
      this.notificationEventService.emitTaskDueSoon({
        task: task,
        message: `Task sắp đến hạn: ${task.title}`,
        taskId: task.id,
        title: task.title,
        scheduledEndDate: task.scheduledEndDate,
        type: NOTIFICATION_EVENTS.TASK_DUE_SOON,
        priority: 'medium',
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Lỗi khi gửi thông báo task sắp đến hạn ${task.id}:`,
        error,
      );
    }
  }

  /**
   * Lấy admin user để làm creator cho auto-generated tasks
   */
  private async getAdminUser(): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        relations: ['roles'],
        where: {
          roles: {
            name: 'admin',
          },
        },
      });
    } catch (error) {
      this.logger.error('Lỗi khi tìm admin user:', error);
      return null;
    }
  }
}
