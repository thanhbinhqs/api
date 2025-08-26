import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { BaseFilterDto } from 'src/common/dto/base-filter.dto';

export class JigFilterDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  mesCode?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  processId?: string;

  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  needMaintenance?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPart?: boolean;
}
