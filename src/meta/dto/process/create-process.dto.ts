import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProcessDto {
    @ApiProperty({ description: 'Tên process' })
    @IsString()
    @Length(2, 100)
    name: string;

    @ApiProperty({ description: 'Slug process' })
    @IsString()
    @Length(2, 100)
    slug: string;

    @ApiProperty({ description: 'Mô tả process', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 500)
    description?: string;

    @ApiProperty({ description: 'Mã process' })
    @IsString()
    @Length(2, 20)
    code: string;
}
