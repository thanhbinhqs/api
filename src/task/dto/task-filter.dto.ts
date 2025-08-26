import {
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  TaskType,
  TaskPriority,
  TaskStatus,
  AssigneeType,
} from '../entities/task.entity';

export class TaskFilterDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  searchContent?: string; // Tìm kiếm trong nội dung chi tiết

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(AssigneeType)
  assigneeType?: AssigneeType;

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  assignedUserId?: string;

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  assignedRoleId?: string;

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  executedBy?: string;

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  createdBy?: string;

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  relatedJigId?: string;

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  relatedJigDetailId?: string;

  // === DATE FILTERS với validation tốt hơn ===
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : value;
  })
  scheduledStartFrom?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : value;
  })
  scheduledStartTo?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : value;
  })
  scheduledEndFrom?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : value;
  })
  scheduledEndTo?: string;

  // === BOOLEAN FILTERS với transform tốt hơn ===
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes')
        return true;
      if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no')
        return false;
    }
    return undefined;
  })
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes')
        return true;
      if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no')
        return false;
    }
    return undefined;
  })
  @IsBoolean()
  isOverdue?: boolean;

  // === STRING ARRAY FILTER ===
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  tags?: string;

  // === PAGINATION với validation ===
  @IsOptional()
  @Transform(({ value }) => {
    const num = parseInt(value);
    return isNaN(num) || num < 1 ? 1 : num;
  })
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    const num = parseInt(value);
    return isNaN(num) || num < 1 ? 10 : Math.min(100, num); // Giới hạn max 100
  })
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  // === SORTING với validation ===
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    const allowedFields = [
      'id',
      'title',
      'type',
      'priority',
      'status',
      'assigneeType',
      'createdAt',
      'updatedAt',
      'scheduledStartDate',
      'scheduledEndDate',
      'actualStartDate',
      'actualEndDate',
      'estimatedDuration',
      'actualDuration',
    ];
    return allowedFields.includes(value) ? value : 'createdAt';
  })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    return value === 'ASC' || value === 'DESC' ? value : 'DESC';
  })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
