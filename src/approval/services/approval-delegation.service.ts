import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ApprovalDelegation } from '../entities';
import {
  CreateApprovalDelegationDto,
  UpdateApprovalDelegationDto,
} from '../dto';

@Injectable()
export class ApprovalDelegationService {
  constructor(
    @InjectRepository(ApprovalDelegation)
    private readonly delegationRepository: Repository<ApprovalDelegation>,
  ) {}

  async create(
    createDto: CreateApprovalDelegationDto,
    fromUserId: string,
  ): Promise<ApprovalDelegation> {
    // Kiểm tra không thể ủy quyền cho chính mình
    if (fromUserId === createDto.toUserId) {
      throw new BadRequestException('Cannot delegate to yourself');
    }

    // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
    if (new Date(createDto.startDate) >= new Date(createDto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Kiểm tra ủy quyền trùng lặp
    const queryBuilder = this.delegationRepository
      .createQueryBuilder('delegation')
      .where('delegation.fromUserId = :fromUserId', { fromUserId })
      .andWhere('delegation.toUserId = :toUserId', {
        toUserId: createDto.toUserId,
      })
      .andWhere('delegation.delegationActive = :active', { active: true })
      .andWhere('delegation.startDate <= :endDate', {
        endDate: createDto.endDate,
      })
      .andWhere('delegation.endDate >= :startDate', {
        startDate: createDto.startDate,
      });

    if (createDto.workflowCode) {
      queryBuilder.andWhere('delegation.workflowCode = :workflowCode', {
        workflowCode: createDto.workflowCode,
      });
    } else {
      queryBuilder.andWhere('delegation.workflowCode IS NULL');
    }

    const existingDelegation = await queryBuilder.getOne();

    if (existingDelegation) {
      throw new BadRequestException('Overlapping delegation already exists');
    }

    const delegation = this.delegationRepository.create({
      ...createDto,
      fromUserId,
    });

    return await this.delegationRepository.save(delegation);
  }

  async findByUserId(userId: string): Promise<ApprovalDelegation[]> {
    return await this.delegationRepository.find({
      where: [
        { fromUserId: userId, isActive: true },
        { toUserId: userId, isActive: true },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveDelegations(
    userId: string,
    workflowCode?: string,
  ): Promise<ApprovalDelegation[]> {
    const now = new Date();

    const queryBuilder = this.delegationRepository
      .createQueryBuilder('delegation')
      .where('delegation.fromUserId = :userId', { userId })
      .andWhere('delegation.delegationActive = :active', { active: true })
      .andWhere('delegation.startDate <= :now', { now })
      .andWhere('delegation.endDate >= :now', { now })
      .andWhere('delegation.isActive = :isActive', { isActive: true });

    if (workflowCode) {
      queryBuilder.andWhere(
        '(delegation.workflowCode = :workflowCode OR delegation.workflowCode IS NULL)',
        { workflowCode },
      );
    }

    return await queryBuilder.getMany();
  }

  async findById(id: string): Promise<ApprovalDelegation> {
    const delegation = await this.delegationRepository.findOne({
      where: { id, isActive: true },
    });

    if (!delegation) {
      throw new NotFoundException(`Delegation with id ${id} not found`);
    }

    return delegation;
  }

  async update(
    id: string,
    updateDto: UpdateApprovalDelegationDto,
    userId: string,
  ): Promise<ApprovalDelegation> {
    const delegation = await this.findById(id);

    if (delegation.fromUserId !== userId) {
      throw new BadRequestException('You can only update your own delegations');
    }

    Object.assign(delegation, updateDto);
    delegation.updatedAt = new Date();

    return await this.delegationRepository.save(delegation);
  }

  async delete(id: string, userId: string): Promise<void> {
    const delegation = await this.findById(id);

    if (delegation.fromUserId !== userId) {
      throw new BadRequestException('You can only delete your own delegations');
    }

    // Soft delete
    delegation.isActive = false;
    delegation.deletedAt = new Date();

    await this.delegationRepository.save(delegation);
  }

  async deactivate(id: string, userId: string): Promise<ApprovalDelegation> {
    const delegation = await this.findById(id);

    if (delegation.fromUserId !== userId) {
      throw new BadRequestException(
        'You can only deactivate your own delegations',
      );
    }

    delegation.delegationActive = false;
    delegation.updatedAt = new Date();

    return await this.delegationRepository.save(delegation);
  }

  async getDelegatedApprovers(
    originalApproverId: string,
    workflowCode?: string,
  ): Promise<string[]> {
    const delegations = await this.findActiveDelegations(
      originalApproverId,
      workflowCode,
    );
    return delegations.map((d) => d.toUserId);
  }

  async getEffectiveApprovers(
    originalApprovers: string[],
    workflowCode?: string,
  ): Promise<string[]> {
    const effectiveApprovers = new Set<string>();

    for (const approverId of originalApprovers) {
      // Thêm người phê duyệt gốc
      effectiveApprovers.add(approverId);

      // Thêm những người được ủy quyền
      const delegatedUsers = await this.getDelegatedApprovers(
        approverId,
        workflowCode,
      );
      delegatedUsers.forEach((userId) => effectiveApprovers.add(userId));
    }

    return Array.from(effectiveApprovers);
  }

  async cleanupExpiredDelegations(): Promise<void> {
    const now = new Date();

    await this.delegationRepository.update(
      {
        endDate: LessThanOrEqual(now),
        delegationActive: true,
      },
      {
        delegationActive: false,
        updatedAt: now,
      },
    );
  }
}
