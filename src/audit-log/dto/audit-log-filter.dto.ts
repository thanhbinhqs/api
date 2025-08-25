import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum AuditLogSortField {
  CREATED_AT = 'createdAt',
  TABLE_NAME = 'tableName',
  ACTION = 'action',
  USERNAME = 'username',
}

export class AuditLogFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tableName?: string;

  @ApiPropertyOptional({ enum: ['INSERT', 'UPDATE', 'DELETE'] })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    enum: AuditLogSortField,
    default: AuditLogSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(AuditLogSortField)
  sortField?: AuditLogSortField = AuditLogSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
