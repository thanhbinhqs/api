import { PickType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

export class RegisterDto extends PickType(CreateUserDto, [
  'username',
  'email',
  'fullName',
] as const) {
  @ApiProperty({
    example: 'user123',
    description: 'Tên đăng nhập',
  })
  @Expose()
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Địa chỉ email',
  })
  @Expose()
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên đầy đủ',
  })
  @Expose()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

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
}
