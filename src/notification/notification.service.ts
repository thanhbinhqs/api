import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Permission } from 'src/common/enums/permission.enum';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async sendToUser(userId: string, event: string, data: any) {
    this.notificationGateway.sendToUser(userId, event, data);
  }

  async sendToRole(role: string, event: string, data: any) {
    await this.notificationGateway.sendToRole(role, event, data);
  }

  async sendToAll(event: string, data: any) {
    const users = await this.userRepository.find();
    users.forEach((user) => {
      this.notificationGateway.sendToUser(user.id, event, data);
    });
  }

  async sendToPermission(permission: Permission, event: string, data: any) {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.permissions @> :permission', { permission: [permission] })
      .andWhere('user.isDeleted = false')
      .andWhere('user.isActive = true')
      .getMany();

    users.forEach((user) => {
      this.notificationGateway.sendToUser(user.id, event, data);
    });
  }
}
