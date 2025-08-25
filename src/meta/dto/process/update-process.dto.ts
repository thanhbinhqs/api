import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProcessDto {
    @ApiProperty({ description: 'Tên process', required: false })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    name?: string;

    @ApiProperty({ description: 'Slug process', required: false })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    slug?: string;

    @ApiProperty({ description: 'Mô tả process', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 500)
    description?: string;

    @ApiProperty({ description: 'Mã process', required: false })
    @IsOptional()
    @IsString()
    @Length(2, 20)
    code?: string;
}
