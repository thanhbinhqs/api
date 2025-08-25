import { ApiProperty } from '@nestjs/swagger';
import { Permission } from 'src/common/enums/permission.enum';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Name of role',
    example: 'admin',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of role',
    example: 'Administrator role with full access',
    required: false,
  })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'List of permissions for role',
    enum: Permission,
    enumName: 'Permission',
    example: [Permission.USER_READ, Permission.USER_UPDATE],
    required: false,
    isArray: true,
  })
  @Expose()
  @Transform(({ value }) => value?.map((v) => Permission[v] ?? v))
  @IsOptional()
  permissions?: Permission[];
}
