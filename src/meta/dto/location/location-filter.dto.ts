import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common';
import { ApiProperty } from '@nestjs/swagger';

export class LocationFilterDto extends BaseFilterDto {
  @ApiProperty({ required: false, description: 'Tên location' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Mã location' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false, description: 'Mô tả location' })
  @IsOptional()
  @IsString()
  description?: string;
}
