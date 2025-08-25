import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class AttachFilesToTaskDto {
    @IsArray()
    @IsUUID(4, { each: true })
    fileIds: string[]; // IDs của files đã upload qua file manager

    @IsOptional()
    @IsString()
    category?: string; // instruction, reference, drawing, photo, result, safety, etc.

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

export class UpdateTaskAttachmentsDto {
    @IsOptional()
    @IsArray()
    attachments?: {
        id: string;
        filename: string;
        originalName: string;
        path: string;
        fileSize: number;
        mimeType: string;
        category?: string;
        description?: string;
        uploadedAt: Date;
        uploadedBy: string;
        tags?: string[];
    }[];

    @IsOptional()
    richContent?: {
        images?: string[];
        documents?: string[];
        drawings?: string[];
        videos?: string[];
        relatedLinks?: string[];
    };
}
