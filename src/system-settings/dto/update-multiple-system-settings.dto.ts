import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSystemSettingDto } from './update-system-setting.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UpdateMultipleSystemSettingsDto {
  @ApiProperty({
    type: [UpdateSystemSettingDto],
    description: 'Danh sách các cài đặt hệ thống cần cập nhật',
  })
  @Expose()
  @IsArray({ message: 'Danh sách cài đặt phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => UpdateSystemSettingDto)
  settings: UpdateSystemSettingDto[];
}
