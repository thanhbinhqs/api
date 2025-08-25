import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class BaseFilterDto extends PaginationDto {
    @ApiProperty({ required: false, description: 'Tìm kiếm chung' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false, description: 'Trường sắp xếp' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiProperty({ required: false, enum: ['ASC', 'DESC'], description: 'Thứ tự sắp xếp' })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
