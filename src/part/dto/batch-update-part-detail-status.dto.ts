import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartDetailStatus } from '../entities/part-detail.entity';

export class BatchUpdatePartDetailStatusDto {
  @ApiProperty({
    description: 'Danh sách ID của Part Details cần cập nhật',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 Part Detail để cập nhật' })
  @IsUUID('4', { each: true, message: 'Mỗi ID phải là UUID hợp lệ' })
  partDetailIds: string[];

  @ApiProperty({
    description: 'Trạng thái mới',
    enum: PartDetailStatus,
  })
  @IsEnum(PartDetailStatus, { message: 'Trạng thái không hợp lệ' })
  status: PartDetailStatus;

  @ApiPropertyOptional({ description: 'Ghi chú cho việc cập nhật' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'ID Location mới (nếu có)' })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional({ description: 'ID Jig Detail mới (nếu có)' })
  @IsOptional()
  @IsUUID()
  jigDetailId?: string;

  @ApiPropertyOptional({
    description: 'Có lưu vị trí hiện tại làm mặc định không',
    default: false,
  })
  @IsOptional()
  saveAsDefault?: boolean = false;
}
