import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { PartDetailStatus } from '../entities/part-detail.entity';

export class CreatePartDetailDto {
  @ApiProperty({
    description: 'ID của part',
    example: 'uuid-string',
  })
  @IsString()
  @IsNotEmpty()
  partId: string;

  @ApiProperty({
    description: 'Số serial (duy nhất)',
    example: 'SN-MOT-001-2024',
  })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @ApiPropertyOptional({
    description: 'ID của vị trí',
    example: 'uuid-string',
  })
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái',
    example: PartDetailStatus.AVAILABLE,
    enum: PartDetailStatus,
    default: PartDetailStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(PartDetailStatus)
  status?: PartDetailStatus = PartDetailStatus.AVAILABLE;

  @ApiPropertyOptional({
    description: 'Ngày mua',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày hết hạn bảo hành',
    example: '2025-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  warrantyExpiration?: string;

  @ApiPropertyOptional({
    description: 'Ngày bảo trì lần cuối',
    example: '2024-06-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  lastMaintenanceDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày bảo trì tiếp theo',
    example: '2024-12-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;

  @ApiPropertyOptional({
    description: 'Ghi chú',
    example: 'Cần kiểm tra định kỳ hàng tháng',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'ID của jig detail (nếu part detail thuộc về jig detail)',
    example: 'uuid-string',
  })
  @IsString()
  @IsOptional()
  jigDetailId?: string;
}
