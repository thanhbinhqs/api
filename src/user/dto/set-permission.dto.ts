import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Permission } from 'src/common/enums/permission.enum';

export class SetPermissionDto {
  @ApiProperty({
    description: 'List of permissions to assign',
    enum: Permission,
    isArray: true,
  })
  @IsArray()
  permissions: Permission[];
}
