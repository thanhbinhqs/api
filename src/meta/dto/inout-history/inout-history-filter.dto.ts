import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { BaseFilterDto } from 'src/common';
import { ApiProperty } from '@nestjs/swagger';
import { InOutType } from '../../entities/inout-history.entity';
import { Transform } from 'class-transformer';

export class InOutHistoryFilterDto extends BaseFilterDto {
    @ApiProperty({ required: false, description: 'Loại giao dịch', enum: InOutType })
    @IsOptional()
    @IsEnum(InOutType)
    type?: InOutType;

    @ApiProperty({ required: false, description: 'Số lượng tối thiểu' })
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    minQuantity?: number;

    @ApiProperty({ required: false, description: 'Số lượng tối đa' })
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    maxQuantity?: number;

    @ApiProperty({ required: false, description: 'Ngày bắt đầu (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ required: false, description: 'Ngày kết thúc (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ required: false, description: 'ID của part' })
    @IsOptional()
    @IsString()
    partId?: string;

    @ApiProperty({ required: false, description: 'ID của part detail' })
    @IsOptional()
    @IsString()
    partDetailId?: string;

    @ApiProperty({ required: false, description: 'Mô tả' })
    @IsOptional()
    @IsString()
    description?: string;
}
