import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ApprovalWorkflow,
  ApprovalStep,
  ApprovalRequest,
  ApprovalStepInstance,
  ApprovalAction,
  ApprovalComment,
  ApprovalDelegation,
} from './entities';
import {
  ApprovalWorkflowService,
  ApprovalStepService,
  ApprovalRequestService,
  ApprovalCommentService,
  ApprovalDelegationService,
} from './services';
import { ApprovalWorkflowController } from './controllers/approval-workflow.controller';
import { ApprovalRequestController } from './controllers/approval-request.controller';
import { ApprovalDelegationController } from './controllers/approval-delegation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApprovalWorkflow,
      ApprovalStep,
      ApprovalRequest,
      ApprovalStepInstance,
      ApprovalAction,
      ApprovalComment,
      ApprovalDelegation,
    ]),
  ],
  controllers: [
    ApprovalWorkflowController,
    ApprovalRequestController,
    ApprovalDelegationController,
  ],
  providers: [
    ApprovalWorkflowService,
    ApprovalStepService,
    ApprovalRequestService,
    ApprovalCommentService,
    ApprovalDelegationService,
  ],
  exports: [
    ApprovalWorkflowService,
    ApprovalStepService,
    ApprovalRequestService,
    ApprovalCommentService,
    ApprovalDelegationService,
  ],
})
export class ApprovalModule {}
