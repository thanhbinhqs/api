import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SystemSettingFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Key phải là chuỗi ký tự' })
  key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Version phải là chuỗi ký tự' })
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  updatedAt?: Date;
}
