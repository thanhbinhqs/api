import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLineDto {
    @ApiProperty({ description: 'Tên line', required: false })
    @IsOptional()
    @IsString()
    @Length(2, 50)
    name?: string;

    @ApiProperty({ description: 'Slug line', required: false })
    @IsOptional()
    @IsString()
    @Length(2, 50)
    slug?: string;

    @ApiProperty({ description: 'Mô tả line', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 255)
    description?: string;

    @ApiProperty({ description: 'Mã line', required: false })
    @IsOptional()
    @IsString()
    @Length(2, 20)
    code?: string;

    @ApiProperty({ description: 'ID zone', required: false })
    @IsOptional()
    @IsString()
    zoneId?: string;
}
