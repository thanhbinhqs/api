import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
    @ApiProperty({ description: 'Tên vendor' })
    @IsString()
    @Length(2, 100)
    name: string;

    @ApiProperty({ description: 'Mã vendor' })
    @IsString()
    @Length(2, 20)
    code: string;

    @ApiProperty({ description: 'Mô tả vendor', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 500)
    description?: string;
}
