import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetActiveDto {
  @ApiProperty({ description: 'User active status' })
  @IsBoolean()
  isActive: boolean;
}
