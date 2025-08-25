import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SetPasswordDto {
  @ApiProperty({ description: 'New password' })
  @IsString()
  @MinLength(8)
  password: string;
}
