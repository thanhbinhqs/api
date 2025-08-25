import { IsString, IsOptional, IsDateString, IsObject, IsBoolean } from 'class-validator';

export class CreateApprovalDelegationDto {
  @IsString()
  toUserId: string;

  @IsOptional()
  @IsString()
  workflowCode?: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateApprovalDelegationDto {
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  delegationActive?: boolean;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
