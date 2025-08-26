import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectFilterDto extends BaseFilterDto {
  @ApiProperty({ required: false, description: 'Tên project' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Slug project' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false, description: 'Tên thân thiện' })
  @IsOptional()
  @IsString()
  friendlyName?: string;

  @ApiProperty({ required: false, description: 'Mã project' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false, description: 'Mô tả project' })
  @IsOptional()
  @IsString()
  description?: string;
}
