import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common';
import { ApiProperty } from '@nestjs/swagger';

export class ZoneFilterDto extends BaseFilterDto {
    @ApiProperty({ required: false, description: 'Tên zone' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false, description: 'Slug zone' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({ required: false, description: 'Mã zone' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiProperty({ required: false, description: 'Mô tả zone' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false, description: 'ID zone cha' })
    @IsOptional()
    @IsString()
    parentZoneId?: string;
}
