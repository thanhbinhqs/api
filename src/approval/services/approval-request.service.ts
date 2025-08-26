import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ApprovalRequest,
  ApprovalStepInstance,
  ApprovalAction,
  ApprovalWorkflow,
  ApprovalStep,
} from '../entities';
import {
  CreateApprovalRequestDto,
  ApprovalActionDto,
  WithdrawApprovalRequestDto,
  ApprovalRequestQueryDto,
} from '../dto';
import { ApprovalStatus, ApprovalStepStatus, ApprovalType } from '../enums';
import { ApprovalWorkflowService } from './approval-workflow.service';
import { ApprovalStepService } from './approval-step.service';

@Injectable()
export class ApprovalRequestService {
  constructor(
    @InjectRepository(ApprovalRequest)
    private readonly requestRepository: Repository<ApprovalRequest>,
    @InjectRepository(ApprovalStepInstance)
    private readonly stepInstanceRepository: Repository<ApprovalStepInstance>,
    @InjectRepository(ApprovalAction)
    private readonly actionRepository: Repository<ApprovalAction>,
    private readonly workflowService: ApprovalWorkflowService,
    private readonly stepService: ApprovalStepService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createDto: CreateApprovalRequestDto,
    requesterId: string,
  ): Promise<ApprovalRequest> {
    // Lấy workflow
    const workflow = await this.workflowService.findByCode(
      createDto.workflowCode,
    );

    // Lấy steps của workflow
    const steps = await this.stepService.findByWorkflowId(workflow.id);

    if (steps.length === 0) {
      throw new BadRequestException('Workflow has no steps configured');
    }

    // Tạo approval request
    const request = this.requestRepository.create({
      workflowId: workflow.id,
      requesterId,
      title: createDto.title,
      description: createDto.description,
      entityType: createDto.entityType,
      entityId: createDto.entityId,
      entityData: createDto.entityData,
      priority: createDto.priority,
      dueDate: createDto.dueDate,
      metadata: createDto.metadata,
      submittedAt: new Date(),
      currentStepOrder: 1,
    });

    const savedRequest = await this.requestRepository.save(request);

    // Tạo step instances
    await this.createStepInstances(savedRequest, steps);

    // Bắt đầu quy trình phê duyệt
    await this.startApprovalProcess(savedRequest.id);

    // Emit event
    this.eventEmitter.emit('approval.request.created', {
      requestId: savedRequest.id,
      requesterId,
      workflowCode: createDto.workflowCode,
      entityType: createDto.entityType,
      entityId: createDto.entityId,
    });

    return await this.findById(savedRequest.id);
  }

  async findById(id: string): Promise<ApprovalRequest> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: [
        'workflow',
        'stepInstances',
        'stepInstances.actions',
        'comments',
      ],
    });

    if (!request) {
      throw new NotFoundException(`Approval request with id ${id} not found`);
    }

    return request;
  }

  async findAll(
    query: ApprovalRequestQueryDto,
  ): Promise<{ data: ApprovalRequest[]; total: number }> {
    const queryBuilder = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.workflow', 'workflow')
      .leftJoinAndSelect('request.stepInstances', 'stepInstances')
      .where('request.isActive = :isActive', { isActive: true });

    // Apply filters
    if (query.status) {
      queryBuilder.andWhere('request.status = :status', {
        status: query.status,
      });
    }

    if (query.priority) {
      queryBuilder.andWhere('request.priority = :priority', {
        priority: query.priority,
      });
    }

    if (query.entityType) {
      queryBuilder.andWhere('request.entityType = :entityType', {
        entityType: query.entityType,
      });
    }

    if (query.requesterId) {
      queryBuilder.andWhere('request.requesterId = :requesterId', {
        requesterId: query.requesterId,
      });
    }

    if (query.workflowCode) {
      queryBuilder.andWhere('workflow.code = :workflowCode', {
        workflowCode: query.workflowCode,
      });
    }

    if (query.fromDate) {
      queryBuilder.andWhere('request.createdAt >= :fromDate', {
        fromDate: query.fromDate,
      });
    }

    if (query.toDate) {
      queryBuilder.andWhere('request.createdAt <= :toDate', {
        toDate: query.toDate,
      });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(request.title ILIKE :search OR request.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Sorting
    queryBuilder.orderBy(`request.${query.sortBy}`, query.sortOrder);

    // Pagination
    const total = await queryBuilder.getCount();
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return { data, total };
  }

  async takeAction(
    requestId: string,
    actionDto: ApprovalActionDto,
    approverId: string,
    approverName: string,
  ): Promise<ApprovalRequest> {
    const request = await this.findById(requestId);

    if (request.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Request is not in pending status');
    }

    // Lấy step instance hiện tại
    const currentStepInstance = request.stepInstances.find(
      (si) => si.stepOrder === request.currentStepOrder,
    );

    if (!currentStepInstance) {
      throw new NotFoundException('Current step instance not found');
    }

    // Kiểm tra quyền phê duyệt
    if (!currentStepInstance.assignedApprovers.includes(approverId)) {
      throw new ForbiddenException('You are not assigned to approve this step');
    }

    // Kiểm tra đã phê duyệt chưa
    const existingAction = currentStepInstance.actions?.find(
      (action) => action.approverId === approverId,
    );

    if (existingAction) {
      throw new BadRequestException(
        'You have already taken action on this step',
      );
    }

    // Tạo action
    const action = this.actionRepository.create({
      requestId,
      stepInstanceId: currentStepInstance.id,
      approverId,
      approverName,
      action:
        actionDto.action === 'approved'
          ? ApprovalStatus.APPROVED
          : actionDto.action === 'rejected'
            ? ApprovalStatus.REJECTED
            : ApprovalStatus.RETURNED,
      comments: actionDto.comments,
      actionDate: new Date(),
      attachments: actionDto.attachments,
      metadata: actionDto.metadata,
    });

    await this.actionRepository.save(action);

    // Xử lý kết quả action
    await this.processStepAction(request, currentStepInstance, action);

    // Emit event
    this.eventEmitter.emit('approval.action.taken', {
      requestId,
      stepInstanceId: currentStepInstance.id,
      approverId,
      action: actionDto.action,
    });

    return await this.findById(requestId);
  }

  async withdraw(
    requestId: string,
    withdrawDto: WithdrawApprovalRequestDto,
    requesterId: string,
  ): Promise<ApprovalRequest> {
    const request = await this.findById(requestId);

    if (request.requesterId !== requesterId) {
      throw new ForbiddenException('You can only withdraw your own requests');
    }

    if (request.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be withdrawn');
    }

    request.status = ApprovalStatus.WITHDRAWN;
    request.rejectionReason = withdrawDto.reason;
    request.completedAt = new Date();

    await this.requestRepository.save(request);

    // Emit event
    this.eventEmitter.emit('approval.request.withdrawn', {
      requestId,
      requesterId,
      reason: withdrawDto.reason,
    });

    return request;
  }

  private async createStepInstances(
    request: ApprovalRequest,
    steps: ApprovalStep[],
  ): Promise<void> {
    for (const step of steps) {
      const stepInstanceData = {
        requestId: request.id,
        stepId: step.id,
        stepOrder: step.stepOrder,
        name: step.name,
        assignedApprovers: step.approvers,
        requiredApprovals: step.requiredApprovals,
        status:
          step.stepOrder === 1
            ? ApprovalStepStatus.PENDING
            : ApprovalStepStatus.WAITING,
        ...(step.stepOrder === 1 && { startedAt: new Date() }),
        ...(step.timeoutHours && {
          dueDate: new Date(Date.now() + step.timeoutHours * 60 * 60 * 1000),
        }),
      };

      const stepInstance = this.stepInstanceRepository.create(stepInstanceData);
      await this.stepInstanceRepository.save(stepInstance);
    }
  }

  private async startApprovalProcess(requestId: string): Promise<void> {
    // Emit event để gửi thông báo cho người phê duyệt đầu tiên
    this.eventEmitter.emit('approval.step.started', {
      requestId,
      stepOrder: 1,
    });
  }

  private async processStepAction(
    request: ApprovalRequest,
    stepInstance: ApprovalStepInstance,
    action: ApprovalAction,
  ): Promise<void> {
    if (
      action.action === ApprovalStatus.REJECTED ||
      action.action === ApprovalStatus.RETURNED
    ) {
      // Từ chối hoặc trả về
      stepInstance.status =
        action.action === ApprovalStatus.REJECTED
          ? ApprovalStepStatus.REJECTED
          : ApprovalStepStatus.PENDING;
      stepInstance.completedAt = new Date();

      request.status = action.action;
      request.completedAt = new Date();
      request.rejectionReason = action.comments;

      await this.stepInstanceRepository.save(stepInstance);
      await this.requestRepository.save(request);
    } else if (action.action === ApprovalStatus.APPROVED) {
      // Phê duyệt
      stepInstance.currentApprovals += 1;

      if (stepInstance.currentApprovals >= stepInstance.requiredApprovals) {
        // Bước hoàn thành
        stepInstance.status = ApprovalStepStatus.APPROVED;
        stepInstance.completedAt = new Date();

        // Chuyển sang bước tiếp theo hoặc hoàn thành
        await this.moveToNextStep(request);
      }

      await this.stepInstanceRepository.save(stepInstance);
    }
  }

  private async moveToNextStep(request: ApprovalRequest): Promise<void> {
    const nextStepOrder = request.currentStepOrder + 1;
    const nextStepInstance = await this.stepInstanceRepository.findOne({
      where: {
        requestId: request.id,
        stepOrder: nextStepOrder,
      },
    });

    if (nextStepInstance) {
      // Có bước tiếp theo
      nextStepInstance.status = ApprovalStepStatus.PENDING;
      nextStepInstance.startedAt = new Date();

      request.currentStepOrder = nextStepOrder;
      request.currentStepId = nextStepInstance.id;

      await this.stepInstanceRepository.save(nextStepInstance);
      await this.requestRepository.save(request);

      // Emit event
      this.eventEmitter.emit('approval.step.started', {
        requestId: request.id,
        stepOrder: nextStepOrder,
      });
    } else {
      // Không có bước tiếp theo - hoàn thành
      request.status = ApprovalStatus.APPROVED;
      request.completedAt = new Date();

      await this.requestRepository.save(request);

      // Emit event
      this.eventEmitter.emit('approval.request.completed', {
        requestId: request.id,
        status: ApprovalStatus.APPROVED,
      });
    }
  }

  async getMyRequests(
    userId: string,
    query: ApprovalRequestQueryDto,
  ): Promise<{ data: ApprovalRequest[]; total: number }> {
    const modifiedQuery = { ...query, requesterId: userId };
    return await this.findAll(modifiedQuery);
  }

  async getPendingRequests(
    userId: string,
    query: ApprovalRequestQueryDto,
  ): Promise<{ data: ApprovalRequest[]; total: number }> {
    const queryBuilder = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.workflow', 'workflow')
      .leftJoinAndSelect('request.stepInstances', 'stepInstances')
      .leftJoinAndSelect('stepInstances.actions', 'actions')
      .where('request.status = :status', { status: ApprovalStatus.PENDING })
      .andWhere('stepInstances.status = :stepStatus', {
        stepStatus: ApprovalStepStatus.PENDING,
      })
      .andWhere('stepInstances.assignedApprovers::jsonb ? :userId', { userId })
      .andWhere('request.isActive = :isActive', { isActive: true });

    // Apply other filters
    if (query.priority) {
      queryBuilder.andWhere('request.priority = :priority', {
        priority: query.priority,
      });
    }

    if (query.entityType) {
      queryBuilder.andWhere('request.entityType = :entityType', {
        entityType: query.entityType,
      });
    }

    if (query.workflowCode) {
      queryBuilder.andWhere('workflow.code = :workflowCode', {
        workflowCode: query.workflowCode,
      });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(request.title ILIKE :search OR request.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Sorting
    queryBuilder.orderBy(`request.${query.sortBy}`, query.sortOrder);

    // Pagination
    const total = await queryBuilder.getCount();
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return { data, total };
  }
}
