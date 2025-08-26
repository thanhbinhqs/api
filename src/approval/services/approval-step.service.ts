import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalStep } from '../entities';
import { CreateApprovalStepDto, UpdateApprovalStepDto } from '../dto';

@Injectable()
export class ApprovalStepService {
  constructor(
    @InjectRepository(ApprovalStep)
    private readonly stepRepository: Repository<ApprovalStep>,
  ) {}

  async create(createDto: CreateApprovalStepDto): Promise<ApprovalStep> {
    // Kiểm tra step order đã tồn tại trong workflow
    const existingStep = await this.stepRepository.findOne({
      where: {
        workflowId: createDto.workflowId,
        stepOrder: createDto.stepOrder,
      },
    });

    if (existingStep) {
      throw new BadRequestException(
        `Step with order ${createDto.stepOrder} already exists in workflow`,
      );
    }

    const step = this.stepRepository.create({
      ...createDto,
      requiredApprovals: createDto.requiredApprovals || 1,
    });

    return await this.stepRepository.save(step);
  }

  async findByWorkflowId(workflowId: string): Promise<ApprovalStep[]> {
    return await this.stepRepository.find({
      where: { workflowId, isActive: true },
      order: { stepOrder: 'ASC' },
    });
  }

  async findById(id: string): Promise<ApprovalStep> {
    const step = await this.stepRepository.findOne({
      where: { id, isActive: true },
      relations: ['workflow'],
    });

    if (!step) {
      throw new NotFoundException(`Step with id ${id} not found`);
    }

    return step;
  }

  async update(
    id: string,
    updateDto: UpdateApprovalStepDto,
  ): Promise<ApprovalStep> {
    const step = await this.findById(id);

    Object.assign(step, updateDto);
    step.updatedAt = new Date();

    return await this.stepRepository.save(step);
  }

  async delete(id: string): Promise<void> {
    const step = await this.findById(id);

    // Soft delete
    step.isActive = false;
    step.deletedAt = new Date();

    await this.stepRepository.save(step);
  }

  async reorderSteps(
    workflowId: string,
    stepOrders: { stepId: string; order: number }[],
  ): Promise<ApprovalStep[]> {
    const steps = await this.findByWorkflowId(workflowId);

    for (const stepOrder of stepOrders) {
      const step = steps.find((s) => s.id === stepOrder.stepId);
      if (step) {
        step.stepOrder = stepOrder.order;
        await this.stepRepository.save(step);
      }
    }

    return await this.findByWorkflowId(workflowId);
  }

  async validateWorkflowSteps(workflowId: string): Promise<boolean> {
    const steps = await this.findByWorkflowId(workflowId);

    // Kiểm tra có ít nhất 1 step
    if (steps.length === 0) {
      return false;
    }

    // Kiểm tra step order liên tục (1, 2, 3...)
    const sortedSteps = steps.sort((a, b) => a.stepOrder - b.stepOrder);
    for (let i = 0; i < sortedSteps.length; i++) {
      if (sortedSteps[i].stepOrder !== i + 1) {
        return false;
      }
    }

    return true;
  }
}
