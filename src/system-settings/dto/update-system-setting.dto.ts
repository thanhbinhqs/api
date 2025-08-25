import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class UpdateSystemSettingDto {
  @ApiProperty({
    description: 'Key của cài đặt hệ thống',
    example: 'MAX_LOGIN_ATTEMPTS',
  })
  @Expose()
  @IsString({ message: 'Key phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Key không được để trống' })
  key: string;

  @ApiProperty({
    description: 'Giá trị của cài đặt hệ thống',
    example: '5',
  })
  @Expose()
  @Type(() => Object)
  @IsNotEmpty({ message: 'Giá trị không được để trống' })
  value: any;

  @ApiProperty({
    description: 'Phiên bản của cài đặt hệ thống (nếu có)',
    example: '1.0.0',
    required: false,
  })
  @Expose()
  @IsOptional()
  version?: string;
}
