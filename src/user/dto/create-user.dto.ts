import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  Matches,
  IsArray,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Buffer } from 'buffer';
import { Permission } from 'src/common/enums/permission.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username for user',
    example: 'newuser',
  })
  @Expose()
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description:
      'Mật khẩu (tối thiểu 8 ký tự, chứa chữ hoa, chữ thường, số và ký tự đặc biệt)',
  })
  @Expose()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ hoa',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ thường',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Mật khẩu phải chứa ít nhất một số',
  })
  @Matches(/(?=.*\W)/, {
    message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt',
  })
  password: string;

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

  @ApiProperty({
    description: 'List of permissions to assign',
    enum: Permission,
    isArray: true,
  })
  @IsArray()
  permissions: Permission[];

  @ApiProperty({
    description: 'Array of role IDs to assign to user',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  roleIds: string[];
}
