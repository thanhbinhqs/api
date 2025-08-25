import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessFilterDto extends BaseFilterDto {
    @ApiProperty({ required: false, description: 'Tên process' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false, description: 'Slug process' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({ required: false, description: 'Mã process' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiProperty({ required: false, description: 'Mô tả process' })
    @IsOptional()
    @IsString()
    description?: string;
}
