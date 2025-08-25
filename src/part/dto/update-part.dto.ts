import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreatePartDto } from './create-part.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePartDto extends PartialType(CreatePartDto) {
  @ApiProperty({
    description: 'Version để kiểm tra optimistic locking',
    example: 'uuid-version-string'
  })
  @IsString()
  @IsNotEmpty()
  version: string;
}
