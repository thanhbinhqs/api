import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, LessThan } from 'typeorm';
import { Task, TaskType, TaskStatus, AssigneeType, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateRichTaskDto } from './dto/create-rich-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { AttachFilesToTaskDto, UpdateTaskAttachmentsDto } from './dto/task-attachments.dto';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';
import { Jig } from '../jig/entities/jig.entity';
import { JigDetail } from '../jig/entities/jig-detail.entity';
import { NOTIFICATION_EVENTS, NotificationData } from '../common/constants/notification-events';
import { NotificationEventService } from '../common/services/notification-event.service';

@Injectable()
export class TaskService {
    private readonly logger = new Logger(TaskService.name);

    constructor(
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(Jig)
        private jigRepository: Repository<Jig>,
        @InjectRepository(JigDetail)
        private jigDetailRepository: Repository<JigDetail>,
        private readonly notificationEventService: NotificationEventService,
    ) {}

    async create(createTaskDto: CreateTaskDto, createdByUserId: string): Promise<Task> {
        const createdByUser = await this.userRepository.findOne({
            where: { id: createdByUserId }
        });

        if (!createdByUser) {
            throw new NotFoundException('User không tồn tại');
        }

        const task = this.taskRepository.create(createTaskDto);
        task.taskCreatedBy = createdByUser;
        task.scheduledStartDate = createTaskDto.scheduledStartDate ? new Date(createTaskDto.scheduledStartDate) : undefined;
        task.scheduledEndDate = createTaskDto.scheduledEndDate ? new Date(createTaskDto.scheduledEndDate) : undefined;

        // Gán users
        if (createTaskDto.assignedUserIds?.length) {
            const users = await this.userRepository.findBy({
                id: In(createTaskDto.assignedUserIds)
            });
            task.assignedUsers = users;
        }

        // Gán roles
        if (createTaskDto.assignedRoleIds?.length) {
            const roles = await this.roleRepository.findBy({
                id: In(createTaskDto.assignedRoleIds)
            });
            task.assignedRoles = roles;
        }

        // Gán jig
        if (createTaskDto.relatedJigId) {
            const jig = await this.jigRepository.findOne({
                where: { id: createTaskDto.relatedJigId }
            });
            if (jig) {
                task.relatedJig = jig;
            }
        }

        // Gán jig detail
        if (createTaskDto.relatedJigDetailId) {
            const jigDetail = await this.jigDetailRepository.findOne({
                where: { id: createTaskDto.relatedJigDetailId }
            });
            if (jigDetail) {
                task.relatedJigDetail = jigDetail;
            }
        }

        const savedTask = await this.taskRepository.save(task);

        // Gửi thông báo khi tạo task mới
        this.notificationEventService.emitTaskCreated({
            task: savedTask,
            message: `Task mới được tạo: ${savedTask.title}`,
            taskId: savedTask.id,
            title: savedTask.title,
            priority: savedTask.priority,
            createdBy: createdByUser.username,
            type: NOTIFICATION_EVENTS.TASK_CREATED,
            timestamp: new Date()
        });

        return savedTask;
    }

    async createRichTask(createRichTaskDto: CreateRichTaskDto, createdByUserId: string): Promise<Task> {
        const createdByUser = await this.userRepository.findOne({
            where: { id: createdByUserId }
        });

        if (!createdByUser) {
            throw new NotFoundException('User không tồn tại');
        }

        const task = this.taskRepository.create(createRichTaskDto);
        task.taskCreatedBy = createdByUser;
        task.scheduledStartDate = createRichTaskDto.scheduledStartDate ? new Date(createRichTaskDto.scheduledStartDate) : undefined;
        task.scheduledEndDate = createRichTaskDto.scheduledEndDate ? new Date(createRichTaskDto.scheduledEndDate) : undefined;

        // Gán users
        if (createRichTaskDto.assignedUserIds?.length) {
            const users = await this.userRepository.findBy({
                id: In(createRichTaskDto.assignedUserIds)
            });
            task.assignedUsers = users;
        }

        // Gán roles
        if (createRichTaskDto.assignedRoleIds?.length) {
            const roles = await this.roleRepository.findBy({
                id: In(createRichTaskDto.assignedRoleIds)
            });
            task.assignedRoles = roles;
        }

        // Gán jig
        if (createRichTaskDto.relatedJigId) {
            const jig = await this.jigRepository.findOne({
                where: { id: createRichTaskDto.relatedJigId }
            });
            if (jig) {
                task.relatedJig = jig;
            }
        }

        // Gán jig detail
        if (createRichTaskDto.relatedJigDetailId) {
            const jigDetail = await this.jigDetailRepository.findOne({
                where: { id: createRichTaskDto.relatedJigDetailId }
            });
            if (jigDetail) {
                task.relatedJigDetail = jigDetail;
            }
        }

        const savedTask = await this.taskRepository.save(task);

        // Gửi thông báo khi tạo rich task mới
        this.notificationEventService.emitTaskCreated({
            task: savedTask,
            message: `Task mới được tạo: ${savedTask.title}`,
            taskId: savedTask.id,
            title: savedTask.title,
            priority: savedTask.priority,
            createdBy: createdByUser.username,
            type: NOTIFICATION_EVENTS.TASK_CREATED,
            timestamp: new Date()
        });

        return savedTask;
    }

    async findAll(filterDto: TaskFilterDto): Promise<{ tasks: Task[]; total: number }> {
        const queryBuilder = this.taskRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.assignedUsers', 'assignedUsers')
            .leftJoinAndSelect('task.assignedRoles', 'assignedRoles')
            .leftJoinAndSelect('task.executedBy', 'executedBy')
            .leftJoinAndSelect('task.taskCreatedBy', 'taskCreatedBy')
            .leftJoinAndSelect('task.relatedJig', 'relatedJig')
            .leftJoinAndSelect('task.relatedJigDetail', 'relatedJigDetail')
            .leftJoinAndSelect('task.parentTask', 'parentTask');

        // Tìm kiếm theo text
        if (filterDto.search) {
            queryBuilder.andWhere(
                '(task.title ILIKE :search OR task.description ILIKE :search)',
                { search: `%${filterDto.search}%` }
            );
        }

        // Tìm kiếm trong nội dung chi tiết
        if (filterDto.searchContent) {
            queryBuilder.andWhere(
                'task.content ILIKE :searchContent',
                { searchContent: `%${filterDto.searchContent}%` }
            );
        }

        // Filter theo các trường enum
        if (filterDto.type) {
            queryBuilder.andWhere('task.type = :type', { type: filterDto.type });
        }

        if (filterDto.priority) {
            queryBuilder.andWhere('task.priority = :priority', { priority: filterDto.priority });
        }

        if (filterDto.status) {
            queryBuilder.andWhere('task.status = :status', { status: filterDto.status });
        }

        if (filterDto.assigneeType) {
            queryBuilder.andWhere('task.assigneeType = :assigneeType', { assigneeType: filterDto.assigneeType });
        }

        // Filter theo assigned user
        if (filterDto.assignedUserId) {
            queryBuilder.andWhere('assignedUsers.id = :assignedUserId', { assignedUserId: filterDto.assignedUserId });
        }

        // Filter theo assigned role
        if (filterDto.assignedRoleId) {
            queryBuilder.andWhere('assignedRoles.id = :assignedRoleId', { assignedRoleId: filterDto.assignedRoleId });
        }

        // Filter theo executed by
        if (filterDto.executedBy) {
            queryBuilder.andWhere('executedBy.id = :executedBy', { executedBy: filterDto.executedBy });
        }

        // Filter theo created by
        if (filterDto.createdBy) {
            queryBuilder.andWhere('taskCreatedBy.id = :createdBy', { createdBy: filterDto.createdBy });
        }

        // Filter theo jig
        if (filterDto.relatedJigId) {
            queryBuilder.andWhere('relatedJig.id = :relatedJigId', { relatedJigId: filterDto.relatedJigId });
        }

        // Filter theo jig detail
        if (filterDto.relatedJigDetailId) {
            queryBuilder.andWhere('relatedJigDetail.id = :relatedJigDetailId', { relatedJigDetailId: filterDto.relatedJigDetailId });
        }

        // Filter theo thời gian
        if (filterDto.scheduledStartFrom) {
            queryBuilder.andWhere('task.scheduledStartDate >= :scheduledStartFrom', { 
                scheduledStartFrom: new Date(filterDto.scheduledStartFrom) 
            });
        }

        if (filterDto.scheduledStartTo) {
            queryBuilder.andWhere('task.scheduledStartDate <= :scheduledStartTo', { 
                scheduledStartTo: new Date(filterDto.scheduledStartTo) 
            });
        }

        if (filterDto.scheduledEndFrom) {
            queryBuilder.andWhere('task.scheduledEndDate >= :scheduledEndFrom', { 
                scheduledEndFrom: new Date(filterDto.scheduledEndFrom) 
            });
        }

        if (filterDto.scheduledEndTo) {
            queryBuilder.andWhere('task.scheduledEndDate <= :scheduledEndTo', { 
                scheduledEndTo: new Date(filterDto.scheduledEndTo) 
            });
        }

        // Filter theo recurring
        if (filterDto.isRecurring !== undefined) {
            queryBuilder.andWhere('task.isRecurring = :isRecurring', { isRecurring: filterDto.isRecurring });
        }

        // Filter overdue tasks
        if (filterDto.isOverdue) {
            const now = new Date();
            queryBuilder.andWhere('task.scheduledEndDate < :now AND task.status NOT IN (:...completedStatuses)', {
                now,
                completedStatuses: [TaskStatus.COMPLETED, TaskStatus.CANCELLED]
            });
        }

        // Filter theo tags
        if (filterDto.tags) {
            const tags = filterDto.tags.split(',').map(tag => tag.trim());
            queryBuilder.andWhere('task.tags ?| array[:...tags]', { tags });
        }

        // Sorting
        queryBuilder.orderBy(`task.${filterDto.sortBy}`, filterDto.sortOrder);

        // Pagination
        const page = filterDto.page || 1;
        const limit = filterDto.limit || 10;
        const total = await queryBuilder.getCount();
        const tasks = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return { tasks, total };
    }

    async findOne(id: string): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: [
                'assignedUsers',
                'assignedRoles',
                'executedBy',
                'taskCreatedBy',
                'relatedJig',
                'relatedJigDetail',
                'parentTask'
            ]
        });

        if (!task) {
            throw new NotFoundException('Task không tồn tại');
        }

        return task;
    }

    async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const task = await this.findOne(id);

        // Update basic fields
        Object.assign(task, {
            ...updateTaskDto,
            actualStartDate: updateTaskDto.actualStartDate ? new Date(updateTaskDto.actualStartDate) : task.actualStartDate,
            actualEndDate: updateTaskDto.actualEndDate ? new Date(updateTaskDto.actualEndDate) : task.actualEndDate,
            scheduledStartDate: updateTaskDto.scheduledStartDate ? new Date(updateTaskDto.scheduledStartDate) : task.scheduledStartDate,
            scheduledEndDate: updateTaskDto.scheduledEndDate ? new Date(updateTaskDto.scheduledEndDate) : task.scheduledEndDate,
        });

        // Calculate actual duration if both start and end dates are provided
        if (task.actualStartDate && task.actualEndDate) {
            task.actualDuration = Math.floor(
                (task.actualEndDate.getTime() - task.actualStartDate.getTime()) / (1000 * 60)
            );
        }

        // Update assigned users
        if (updateTaskDto.assignedUserIds) {
            const users = await this.userRepository.findBy({
                id: In(updateTaskDto.assignedUserIds)
            });
            task.assignedUsers = users;
        }

        // Update assigned roles
        if (updateTaskDto.assignedRoleIds) {
            const roles = await this.roleRepository.findBy({
                id: In(updateTaskDto.assignedRoleIds)
            });
            task.assignedRoles = roles;
        }

        const savedTask = await this.taskRepository.save(task);

        // Gửi thông báo khi cập nhật task
        let notificationMessage = `Task được cập nhật: ${savedTask.title}`;
        let eventType: string = NOTIFICATION_EVENTS.TASK_UPDATED;

        // Kiểm tra xem có thay đổi status không
        if (updateTaskDto.status && updateTaskDto.status !== task.status) {
            notificationMessage = `Trạng thái task đã thay đổi: ${savedTask.title} - ${updateTaskDto.status}`;
            eventType = NOTIFICATION_EVENTS.TASK_STATUS_CHANGED;
        }

        this.notificationEventService.emitTaskUpdated({
            task: savedTask,
            message: notificationMessage,
            taskId: savedTask.id,
            title: savedTask.title,
            status: savedTask.status,
            priority: savedTask.priority,
            type: eventType,
            timestamp: new Date()
        });

        return savedTask;
    }

    async remove(id: string): Promise<void> {
        const task = await this.findOne(id);
        await this.taskRepository.remove(task);
    }

    async assignTask(taskId: string, userId: string): Promise<Task> {
        const task = await this.findOne(taskId);
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User không tồn tại');
        }

        task.executedBy = user;
        if (task.status === TaskStatus.PENDING) {
            task.status = TaskStatus.IN_PROGRESS;
            task.actualStartDate = new Date();
        }

        const savedTask = await this.taskRepository.save(task);

        // Gửi thông báo khi assign task
        this.notificationEventService.emitTaskAssigned({
            task: savedTask,
            message: `Task được assign cho ${user.username}: ${savedTask.title}`,
            taskId: savedTask.id,
            title: savedTask.title,
            assignedTo: user.username,
            assignedToId: user.id,
            type: NOTIFICATION_EVENTS.TASK_ASSIGNED,
            timestamp: new Date()
        });

        return savedTask;
    }

    async completeTask(taskId: string, completionNotes?: string, checklist?: any[]): Promise<Task> {
        const task = await this.findOne(taskId);

        if (task.status === TaskStatus.COMPLETED) {
            throw new BadRequestException('Task đã được hoàn thành');
        }

        task.status = TaskStatus.COMPLETED;
        task.actualEndDate = new Date();
        task.completionNotes = completionNotes;

        if (checklist) {
            task.checklist = checklist;
        }

        // Calculate actual duration
        if (task.actualStartDate) {
            task.actualDuration = Math.floor(
                (task.actualEndDate.getTime() - task.actualStartDate.getTime()) / (1000 * 60)
            );
        }

        // Nếu task liên quan đến maintenance của jig detail, cập nhật lastMaintenanceDate
        if (task.type === TaskType.MAINTENANCE && task.relatedJigDetail) {
            await this.jigDetailRepository.update(
                { id: task.relatedJigDetail.id },
                { lastMaintenanceDate: new Date() }
            );
        }

        const savedTask = await this.taskRepository.save(task);

        // Gửi thông báo khi hoàn thành task
        this.notificationEventService.emitTaskCompleted({
            task: savedTask,
            message: `Task đã hoàn thành: ${savedTask.title}`,
            taskId: savedTask.id,
            title: savedTask.title,
            completedBy: savedTask.executedBy?.username,
            completedAt: savedTask.actualEndDate,
            completionNotes: savedTask.completionNotes,
            type: NOTIFICATION_EVENTS.TASK_COMPLETED,
            timestamp: new Date()
        });

        // Tạo task tiếp theo nếu đây là recurring task
        if (task.isRecurring && task.recurringInterval) {
            await this.createNextRecurringTask(task);
        }

        return savedTask;
    }

    private async createNextRecurringTask(parentTask: Task): Promise<void> {
        if (!parentTask.recurringInterval) return;
        
        const nextScheduledDate = new Date();
        nextScheduledDate.setDate(nextScheduledDate.getDate() + parentTask.recurringInterval);

        const nextEndDate = new Date(nextScheduledDate);
        if (parentTask.estimatedDuration) {
            nextEndDate.setMinutes(nextEndDate.getMinutes() + parentTask.estimatedDuration);
        }

        const nextTask = this.taskRepository.create({
            title: parentTask.title,
            description: parentTask.description,
            type: parentTask.type,
            priority: parentTask.priority,
            assigneeType: parentTask.assigneeType,
            taskCreatedBy: parentTask.taskCreatedBy,
            scheduledStartDate: nextScheduledDate,
            scheduledEndDate: nextEndDate,
            estimatedDuration: parentTask.estimatedDuration,
            relatedJig: parentTask.relatedJig,
            relatedJigDetail: parentTask.relatedJigDetail,
            isRecurring: parentTask.isRecurring,
            recurringInterval: parentTask.recurringInterval,
            parentTask: parentTask,
            checklist: parentTask.checklist?.map(item => ({ ...item, completed: false })),
            tags: parentTask.tags,
            assignedUsers: parentTask.assignedUsers,
            assignedRoles: parentTask.assignedRoles,
        });

        await this.taskRepository.save(nextTask);
        this.logger.log(`Tạo recurring task tiếp theo cho task ${parentTask.id}`);
    }

    // Lấy thống kê task
    async getTaskStatistics(userId?: string): Promise<any> {
        const queryBuilder = this.taskRepository.createQueryBuilder('task');

        if (userId) {
            queryBuilder.leftJoin('task.assignedUsers', 'user')
                .leftJoin('task.assignedRoles', 'role')
                .leftJoin('role.users', 'roleUser')
                .where('user.id = :userId OR roleUser.id = :userId', { userId });
        }

        const [
            totalTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks,
            overdueTasks,
            maintenanceTasks
        ] = await Promise.all([
            queryBuilder.getCount(),
            queryBuilder.clone().andWhere('task.status = :status', { status: TaskStatus.PENDING }).getCount(),
            queryBuilder.clone().andWhere('task.status = :status', { status: TaskStatus.IN_PROGRESS }).getCount(),
            queryBuilder.clone().andWhere('task.status = :status', { status: TaskStatus.COMPLETED }).getCount(),
            queryBuilder.clone().andWhere('task.status = :status', { status: TaskStatus.OVERDUE }).getCount(),
            queryBuilder.clone().andWhere('task.type = :type', { type: TaskType.MAINTENANCE }).getCount(),
        ]);

        return {
            totalTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks,
            overdueTasks,
            maintenanceTasks
        };
    }

    async attachFilesToTask(taskId: string, attachFilesDto: AttachFilesToTaskDto, userId: string): Promise<Task> {
        const task = await this.findOne(taskId);
        
        // Giả sử có FileManagerService để lấy thông tin file
        // const fileInfos = await this.fileManagerService.getFilesByIds(attachFilesDto.fileIds);
        
        // Tạm thời mock file info - trong thực tế sẽ call file manager service
        const newAttachments = attachFilesDto.fileIds.map(fileId => ({
            id: fileId,
            filename: `file_${fileId}`,
            originalName: `original_${fileId}`,
            path: `/files/${fileId}`,
            fileSize: 0, // sẽ lấy từ file manager
            mimeType: 'application/octet-stream', // sẽ lấy từ file manager
            category: attachFilesDto.category,
            description: attachFilesDto.description,
            uploadedAt: new Date(),
            uploadedBy: userId,
            tags: attachFilesDto.tags || []
        }));

        // Merge với attachments hiện tại
        const currentAttachments = task.attachments || [];
        task.attachments = [...currentAttachments, ...newAttachments];

        return await this.taskRepository.save(task);
    }

    async updateTaskAttachments(taskId: string, updateDto: UpdateTaskAttachmentsDto): Promise<Task> {
        const task = await this.findOne(taskId);
        
        if (updateDto.attachments) {
            task.attachments = updateDto.attachments;
        }
        
        if (updateDto.richContent) {
            task.richContent = updateDto.richContent;
        }

        return await this.taskRepository.save(task);
    }

    async removeAttachmentFromTask(taskId: string, attachmentId: string): Promise<Task> {
        const task = await this.findOne(taskId);
        
        if (task.attachments) {
            task.attachments = task.attachments.filter(att => att.id !== attachmentId);
            await this.taskRepository.save(task);
        }

        return task;
    }

    async getTaskAttachments(taskId: string): Promise<any[]> {
        const task = await this.findOne(taskId);
        return task.attachments || [];
    }

    async getTaskAttachmentsByCategory(taskId: string, category: string): Promise<any[]> {
        const task = await this.findOne(taskId);
        if (!task.attachments) return [];
        
        return task.attachments.filter(att => att.category === category);
    }

    // Lấy các task sắp tới hạn
    async getUpcomingTasks(days: number = 7, userId?: string): Promise<Task[]> {
        const fromDate = new Date();
        const toDate = new Date();
        toDate.setDate(toDate.getDate() + days);

        const queryBuilder = this.taskRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.assignedUsers', 'assignedUsers')
            .leftJoinAndSelect('task.assignedRoles', 'assignedRoles')
            .leftJoinAndSelect('task.relatedJig', 'relatedJig')
            .leftJoinAndSelect('task.relatedJigDetail', 'relatedJigDetail')
            .where('task.scheduledEndDate BETWEEN :fromDate AND :toDate', { fromDate, toDate })
            .andWhere('task.status IN (:...statuses)', { statuses: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] })
            .orderBy('task.scheduledEndDate', 'ASC');

        if (userId) {
            queryBuilder.leftJoin('assignedRoles.users', 'roleUser')
                .andWhere('(assignedUsers.id = :userId OR roleUser.id = :userId)', { userId });
        }

        return await queryBuilder.getMany();
    }
}
