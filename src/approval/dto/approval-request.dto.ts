import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ApprovalPriority } from '../enums';

export class CreateApprovalRequestDto {
  @IsString()
  workflowCode: string; // Sử dụng code thay vì ID

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  entityType: string;

  @IsString()
  entityId: string;

  @IsOptional()
  @IsObject()
  entityData?: Record<string, any>;

  @IsOptional()
  @IsEnum(ApprovalPriority)
  priority?: ApprovalPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ApprovalActionDto {
  @IsString()
  requestId: string;

  @IsEnum(['approved', 'rejected', 'returned'])
  action: 'approved' | 'rejected' | 'returned';

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsObject()
  attachments?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class WithdrawApprovalRequestDto {
  @IsString()
  reason: string;
}

export class DelegateApprovalDto {
  @IsString()
  toUserId: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  endDate?: Date;
}
