import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiProperty({ description: 'Tên project', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiProperty({ description: 'Slug project', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  slug?: string;

  @ApiProperty({ description: 'Tên thân thiện', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  friendlyName?: string;

  @ApiProperty({ description: 'Mô tả project', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ description: 'Mã project', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  code?: string;
}
