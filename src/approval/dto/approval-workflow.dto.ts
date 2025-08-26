import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsInt,
  Min,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalType } from '../enums';

export class CreateApprovalWorkflowDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ApprovalType)
  type: ApprovalType;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Min(1)
  workflowVersion?: number;
}

export class UpdateApprovalWorkflowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ApprovalType)
  type?: ApprovalType;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
