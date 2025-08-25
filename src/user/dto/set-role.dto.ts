import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class SetRoleDto {
  @ApiProperty({
    description: 'Array of role IDs to assign to user',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  roleIds: string[];
}
