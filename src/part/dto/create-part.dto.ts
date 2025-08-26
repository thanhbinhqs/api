import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class CreatePartDto {
  @ApiProperty({
    description: 'Tên của part',
    example: 'Motor DC 12V',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết',
    example: 'Motor DC 12V, 100W, chống nước IP65',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Mã part',
    example: 'MOT-DC-12V-001',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn hình ảnh',
    example: '/images/parts/motor-dc-12v.jpg',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'Giá tiền',
    example: 150000,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number = 0;

  @ApiPropertyOptional({
    description: 'Đơn vị tiền tệ',
    example: 'VND',
    default: 'VND',
  })
  @IsString()
  @IsOptional()
  priceCurrency?: string = 'VND';

  @ApiPropertyOptional({
    description: 'Loại đặt hàng',
    example: 'material',
    enum: ['material', 'mro', 'self-made'],
    default: 'material',
  })
  @IsString()
  @IsIn(['material', 'mro', 'self-made'])
  @IsOptional()
  orderType?: string = 'material';

  @ApiPropertyOptional({
    description: 'Đơn vị tính',
    example: 'pcs',
    default: 'pcs',
  })
  @IsString()
  @IsOptional()
  unit?: string = 'pcs';

  @ApiPropertyOptional({
    description: 'Có quản lý chi tiết hay không',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDetailed?: boolean = false;

  @ApiPropertyOptional({
    description: 'Số lượng tồn kho an toàn',
    example: 10,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  safeStock?: number = 0;

  @ApiPropertyOptional({
    description: 'ID của dự án',
    example: 'uuid-string',
  })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'ID của nhà cung cấp',
    example: 'uuid-string',
  })
  @IsString()
  @IsOptional()
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'ID của vị trí mặc định',
    example: 'uuid-string',
  })
  @IsString()
  @IsOptional()
  defaultLocationId?: string;

  @ApiPropertyOptional({
    description: 'ID của jig (nếu part thuộc về jig)',
    example: 'uuid-string',
  })
  @IsString()
  @IsOptional()
  jigId?: string;
}
