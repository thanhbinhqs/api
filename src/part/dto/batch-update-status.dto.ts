import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator';
import { PartDetailStatus } from '../entities/part-detail.entity';

export class BatchUpdateStatusDto {
  @ApiProperty({
    description: 'Danh sách ID của part details cần cập nhật',
    example: ['uuid-1', 'uuid-2', 'uuid-3']
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  partDetailIds: string[];

  @ApiProperty({
    description: 'Status mới',
    example: PartDetailStatus.IN_USE,
    enum: PartDetailStatus
  })
  @IsString()
  @IsNotEmpty()
  newStatus: PartDetailStatus;

  @ApiProperty({
    description: 'Danh sách versions tương ứng với từng part detail để kiểm tra optimistic locking',
    example: ['version-uuid-1', 'version-uuid-2', 'version-uuid-3']
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  versions: string[];
}
