import {
  IsOptional,
  IsEnum,
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TaskType,
  TaskPriority,
  TaskStatus,
  AssigneeType,
} from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  contentType?: 'html' | 'markdown' | 'plain_text';

  @IsEnum(TaskType)
  type: TaskType;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsEnum(AssigneeType)
  assigneeType: AssigneeType;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  assignedUserIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  assignedRoleIds?: string[];

  @IsOptional()
  @IsDateString()
  scheduledStartDate?: string;

  @IsOptional()
  @IsDateString()
  scheduledEndDate?: string;

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @IsOptional()
  @IsUUID()
  relatedJigId?: string;

  @IsOptional()
  @IsUUID()
  relatedJigDetailId?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsNumber()
  recurringInterval?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class ChecklistItemDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsBoolean()
  completed: boolean;

  @IsBoolean()
  required: boolean;
}
