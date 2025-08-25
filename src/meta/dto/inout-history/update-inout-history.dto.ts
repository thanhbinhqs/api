import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InOutType } from '../../entities/inout-history.entity';

export class UpdateInOutHistoryDto {
    @ApiProperty({ description: 'Số lượng', required: false })
    @IsOptional()
    @IsNumber({}, { message: 'Số lượng phải là số' })
    @Min(0, { message: 'Số lượng phải lớn hơn hoặc bằng 0' })
    quantity?: number;

    @ApiProperty({ description: 'Loại giao dịch', enum: InOutType, required: false })
    @IsOptional()
    @IsEnum(InOutType, { message: 'Loại giao dịch không hợp lệ' })
    type?: InOutType;

    @ApiProperty({ description: 'Mô tả', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'IDs của parts', type: [String], required: false })
    @IsOptional()
    partIds?: string[];

    @ApiProperty({ description: 'IDs của part details', type: [String], required: false })
    @IsOptional()
    partDetailIds?: string[];
}
