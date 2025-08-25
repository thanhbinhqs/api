import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsEnum, IsOptional, IsString, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';
import { Type } from 'class-transformer';
import { ChecklistItemDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsDateString()
    actualStartDate?: string;

    @IsOptional()
    @IsDateString()
    actualEndDate?: string;

    @IsOptional()
    @IsString()
    completionNotes?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    contentType?: 'html' | 'markdown' | 'plain_text';

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChecklistItemDto)
    checklist?: ChecklistItemDto[];
}
