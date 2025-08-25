import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalWorkflow } from '../entities';
import { CreateApprovalWorkflowDto, UpdateApprovalWorkflowDto } from '../dto';

@Injectable()
export class ApprovalWorkflowService {
  constructor(
    @InjectRepository(ApprovalWorkflow)
    private readonly workflowRepository: Repository<ApprovalWorkflow>,
  ) {}

  async create(createDto: CreateApprovalWorkflowDto): Promise<ApprovalWorkflow> {
    // Kiểm tra code đã tồn tại
    const existingWorkflow = await this.workflowRepository.findOne({
      where: { code: createDto.code },
    });

    if (existingWorkflow) {
      throw new BadRequestException(`Workflow with code ${createDto.code} already exists`);
    }

    const workflow = this.workflowRepository.create(createDto);
    return await this.workflowRepository.save(workflow);
  }

  async findAll(): Promise<ApprovalWorkflow[]> {
    return await this.workflowRepository.find({
      where: { isActive: true },
      relations: ['steps'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCode(code: string): Promise<ApprovalWorkflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { code, isActive: true },
      relations: ['steps'],
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with code ${code} not found`);
    }

    return workflow;
  }

  async findById(id: string): Promise<ApprovalWorkflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id, isActive: true },
      relations: ['steps'],
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with id ${id} not found`);
    }

    return workflow;
  }

  async update(id: string, updateDto: UpdateApprovalWorkflowDto): Promise<ApprovalWorkflow> {
    const workflow = await this.findById(id);
    
    Object.assign(workflow, updateDto);
    workflow.updatedAt = new Date();

    return await this.workflowRepository.save(workflow);
  }

  async delete(id: string): Promise<void> {
    const workflow = await this.findById(id);
    
    // Soft delete
    workflow.isActive = false;
    workflow.deletedAt = new Date();
    
    await this.workflowRepository.save(workflow);
  }

  async getActiveWorkflows(): Promise<ApprovalWorkflow[]> {
    return await this.workflowRepository.find({
      where: { isActive: true },
      select: ['id', 'code', 'name', 'type'],
      order: { name: 'ASC' },
    });
  }
}
