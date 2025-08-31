import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
    required: false,
  })
  @Expose()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Employee ID',
    example: '12345678',
    required: false,
  })
  @Expose()
  @IsString({ message: 'EmployeeId không hợp lệ' })
  @IsOptional()
  employeeId?: string;

  @ApiProperty({
    description: 'Full name of user',
    example: 'Nguyen Van A',
    required: false,
  })
  @Expose()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    description: 'Base64 encoded avatar image',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    required: false,
  })
  @Expose()
  @IsString({ message: 'Avatar phải là chuỗi base64' })
  @IsOptional()
  @Transform(({ value }) =>
    value ? Buffer.from(value.split(',')[1], 'base64') : null,
  )
  avatar?: Buffer;

  @ApiProperty({
    description: 'Phone number',
    example: '0987654321',
    required: false,
  })
  @Expose()
  @IsString()
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Số điện thoại phải có 10-15 chữ số',
  })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Birthday in YYYY-MM-DD format',
    example: '1990-01-01',
    required: false,
  })
  @Expose()
  @IsDateString({}, { message: 'Ngày sinh phải có định dạng YYYY-MM-DD' })
  @IsOptional()
  birthday?: string;

  @ApiProperty({
    description: 'Address',
    example: '123 Main Street, Hanoi',
    required: false,
  })
  @Expose()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @IsOptional()
  address?: string;

  //externalInfo can be any JSON object
  @ApiProperty({
    description: 'External information as JSON object',
    example: { facebook: 'fb.com/user', twitter: '@user' },
    required: false,
  })
  @Expose()
  @IsOptional()
  externalInfo?: any;
}
