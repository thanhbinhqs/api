import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVendorDto {
  @ApiProperty({ description: 'Tên vendor', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiProperty({ description: 'Mã vendor', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  code?: string;

  @ApiProperty({ description: 'Mô tả vendor', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}
