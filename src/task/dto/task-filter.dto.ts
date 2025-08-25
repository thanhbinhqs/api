import { IsOptional, IsEnum, IsString, IsUUID, IsDateString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskType, TaskPriority, TaskStatus, AssigneeType } from '../entities/task.entity';

export class TaskFilterDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
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
    assignedUserId?: string;

    @IsOptional()
    @IsUUID()
    assignedRoleId?: string;

    @IsOptional()
    @IsUUID()
    executedBy?: string;

    @IsOptional()
    @IsUUID()
    createdBy?: string;

    @IsOptional()
    @IsUUID()
    relatedJigId?: string;

    @IsOptional()
    @IsUUID()
    relatedJigDetailId?: string;

    @IsOptional()
    @IsDateString()
    scheduledStartFrom?: string;

    @IsOptional()
    @IsDateString()
    scheduledStartTo?: string;

    @IsOptional()
    @IsDateString()
    scheduledEndFrom?: string;

    @IsOptional()
    @IsDateString()
    scheduledEndTo?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    isRecurring?: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    isOverdue?: boolean;

    @IsOptional()
    @IsString()
    tags?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
