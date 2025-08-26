import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BaseFilterDto } from 'src/common/dto/base-filter.dto';
import { PartDetailStatus } from '../entities/part-detail.entity';

export class PartDetailFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo số serial',
    example: 'SN-MOT-001',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái',
    example: PartDetailStatus.AVAILABLE,
    enum: PartDetailStatus,
  })
  @IsOptional()
  @IsEnum(PartDetailStatus)
  status?: PartDetailStatus;

  @ApiPropertyOptional({
    description: 'Lọc theo ID part',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  partId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID vị trí',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID jig detail',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  jigDetailId?: string;
}
