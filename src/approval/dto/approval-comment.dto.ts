import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateApprovalCommentDto {
  @IsString()
  requestId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}

export class UpdateApprovalCommentDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
