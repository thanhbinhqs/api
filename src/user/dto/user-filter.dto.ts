import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { T } from 'node_modules/@faker-js/faker/dist/airline-CLphikKp.cjs';

export class UserFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Mã nhân viên phải là chuỗi ký tự' })
  employeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'IsActive phải là boolean' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return undefined;
  })
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  address?: string;

  @Type(() => Date)
  lastLogin?: Date;

  @Type(() => Date)
  changePasswordAt?: Date;
}
