import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApprovalWorkflowService } from '../services/approval-workflow.service';
import { ApprovalStepService } from '../services/approval-step.service';
import {
  CreateApprovalWorkflowDto,
  UpdateApprovalWorkflowDto,
  CreateApprovalStepDto,
  UpdateApprovalStepDto,
} from '../dto';

@Controller('approval/workflows')
// @UseGuards(JwtAuthGuard) // Sẽ uncomment sau khi có auth guard
export class ApprovalWorkflowController {
  constructor(
    private readonly workflowService: ApprovalWorkflowService,
    private readonly stepService: ApprovalStepService,
  ) {}

  @Post()
  async create(@Body() createDto: CreateApprovalWorkflowDto) {
    return await this.workflowService.create(createDto);
  }

  @Get()
  async findAll() {
    return await this.workflowService.findAll();
  }

  @Get('active')
  async getActive() {
    return await this.workflowService.getActiveWorkflows();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.workflowService.findById(id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return await this.workflowService.findByCode(code);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateApprovalWorkflowDto,
  ) {
    return await this.workflowService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.workflowService.delete(id);
    return { message: 'Workflow deleted successfully' };
  }

  // Step management
  @Post(':id/steps')
  async addStep(
    @Param('id') workflowId: string,
    @Body() createDto: CreateApprovalStepDto,
  ) {
    return await this.stepService.create({ ...createDto, workflowId });
  }

  @Get(':id/steps')
  async getSteps(@Param('id') workflowId: string) {
    return await this.stepService.findByWorkflowId(workflowId);
  }

  @Put(':id/steps/:stepId')
  async updateStep(
    @Param('id') workflowId: string,
    @Param('stepId') stepId: string,
    @Body() updateDto: UpdateApprovalStepDto,
  ) {
    return await this.stepService.update(stepId, updateDto);
  }

  @Delete(':id/steps/:stepId')
  async deleteStep(
    @Param('id') workflowId: string,
    @Param('stepId') stepId: string,
  ) {
    await this.stepService.delete(stepId);
    return { message: 'Step deleted successfully' };
  }

  @Post(':id/steps/reorder')
  async reorderSteps(
    @Param('id') workflowId: string,
    @Body() reorderData: { stepId: string; order: number }[],
  ) {
    return await this.stepService.reorderSteps(workflowId, reorderData);
  }

  @Get(':id/validate')
  async validateWorkflow(@Param('id') workflowId: string) {
    const isValid = await this.stepService.validateWorkflowSteps(workflowId);
    return { isValid };
  }
}
