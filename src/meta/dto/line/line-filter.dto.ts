import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common';
import { ApiProperty } from '@nestjs/swagger';

export class LineFilterDto extends BaseFilterDto {
    @ApiProperty({ required: false, description: 'Tên line' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false, description: 'Slug line' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({ required: false, description: 'Mã line' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiProperty({ required: false, description: 'Mô tả line' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false, description: 'ID zone' })
    @IsOptional()
    @IsString()
    zoneId?: string;
}
