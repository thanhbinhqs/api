import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { BaseFilterDto } from 'src/common/dto/base-filter.dto';
import { JigStatus } from '../entities/jig-detail.entity';

export class JigDetailFilterDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  jigId?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  mesCode?: string;

  @IsOptional()
  @IsEnum(JigStatus)
  status?: JigStatus;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  lineId?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsDateString()
  lastMaintenanceDateFrom?: Date;

  @IsOptional()
  @IsDateString()
  lastMaintenanceDateTo?: Date;
}
