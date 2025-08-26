import { ApiProperty } from '@nestjs/swagger';
import { Zone } from '../../entities/zone.entity';

export class ZoneResponseDto {
  @ApiProperty({ description: 'ID của zone' })
  id: string;

  @ApiProperty({ description: 'Tên zone' })
  name: string;

  @ApiProperty({ description: 'Slug zone' })
  slug: string;

  @ApiProperty({ description: 'Mô tả zone', required: false })
  description?: string;

  @ApiProperty({ description: 'Mã zone', required: false })
  code?: string;

  @ApiProperty({ description: 'Zone cha', required: false })
  parentZone?: ZoneResponseDto;

  @ApiProperty({
    description: 'Danh sách zones con',
    type: [ZoneResponseDto],
    required: false,
  })
  children?: ZoneResponseDto[];

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;

  constructor(zone: Zone) {
    this.id = zone.id;
    this.name = zone.name;
    this.slug = zone.slug;
    this.description = zone.description;
    this.code = zone.code;
    this.parentZone = zone.parentZone
      ? new ZoneResponseDto(zone.parentZone)
      : undefined;
    this.children = zone.children
      ? zone.children.map((child) => new ZoneResponseDto(child))
      : undefined;
    this.createdAt = zone.createdAt;
    this.updatedAt = zone.updatedAt;
  }
}
