import { IsString, IsOptional, IsInt, Min, IsArray, IsBoolean, IsObject } from 'class-validator';

export class CreateApprovalStepDto {
  @IsString()
  workflowId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  stepOrder: number;

  @IsArray()
  @IsString({ each: true })
  approvers: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  approverRoles?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  requiredApprovals?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutHours?: number;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @IsOptional()
  @IsBoolean()
  canDelegate?: boolean;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class UpdateApprovalStepDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  approvers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  approverRoles?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  requiredApprovals?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutHours?: number;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @IsOptional()
  @IsBoolean()
  canDelegate?: boolean;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
