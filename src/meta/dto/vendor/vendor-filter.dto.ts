import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/common';
import { ApiProperty } from '@nestjs/swagger';

export class VendorFilterDto extends BaseFilterDto {
    @ApiProperty({ required: false, description: 'Tên vendor' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false, description: 'Mã vendor' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiProperty({ required: false, description: 'Mô tả vendor' })
    @IsOptional()
    @IsString()
    description?: string;
}
