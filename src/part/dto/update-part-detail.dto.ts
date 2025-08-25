import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreatePartDetailDto } from './create-part-detail.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePartDetailDto extends PartialType(CreatePartDetailDto) {
  @ApiProperty({
    description: 'Version để kiểm tra optimistic locking',
    example: 'uuid-version-string'
  })
  @IsString()
  @IsNotEmpty()
  version: string;
}
