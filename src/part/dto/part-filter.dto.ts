import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';
import { BaseFilterDto } from 'src/common/dto/base-filter.dto';

export class PartFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo mã part',
    example: 'MOT-DC'
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo loại đặt hàng',
    example: 'material',
    enum: ['material', 'mro', 'self-made']
  })
  @IsOptional()
  @IsString()
  @IsIn(['material', 'mro', 'self-made'])
  orderType?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo có quản lý chi tiết hay không',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isDetailed?: boolean;

  @ApiPropertyOptional({
    description: 'Lọc theo ID dự án',
    example: 'uuid-string'
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID nhà cung cấp',
    example: 'uuid-string'
  })
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID vị trí mặc định',
    example: 'uuid-string'
  })
  @IsOptional()
  @IsString()
  defaultLocationId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID jig',
    example: 'uuid-string'
  })
  @IsOptional()
  @IsString()
  jigId?: string;
}
