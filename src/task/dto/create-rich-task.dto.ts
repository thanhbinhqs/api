import { IsOptional, IsEnum, IsString, IsArray, IsBoolean, IsNumber, IsDateString, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskType, TaskPriority, AssigneeType } from '../entities/task.entity';
import { ChecklistItemDto } from './create-task.dto';

export class CreateRichTaskDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    content?: string; // Nội dung chi tiết

    @IsOptional()
    @IsEnum(['html', 'markdown', 'plain_text'])
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

    // Metadata cho nội dung phong phú (sử dụng file manager)
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachmentFileIds?: string[]; // File IDs từ file manager

    @IsOptional()
    richContent?: {
        images?: string[]; // File IDs từ file manager
        documents?: string[]; // File IDs từ file manager
        drawings?: string[]; // File IDs từ file manager
        videos?: string[]; // File IDs hoặc URLs
        relatedLinks?: string[]; // Các link liên quan
    };

    @IsOptional()
    @IsString()
    safetyInstructions?: string; // Hướng dẫn an toàn

    @IsOptional()
    @IsString()
    toolsRequired?: string; // Dụng cụ cần thiết

    @IsOptional()
    @IsString()
    expectedOutcome?: string; // Kết quả mong đợi
}
