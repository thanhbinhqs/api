import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ description: 'Tên location', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiProperty({ description: 'Mã location (unique)', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  code?: string;

  @ApiProperty({ description: 'Mô tả location', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}
