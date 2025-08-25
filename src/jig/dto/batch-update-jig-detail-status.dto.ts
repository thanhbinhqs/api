import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JigStatus } from '../entities/jig-detail.entity';

export class BatchUpdateJigDetailStatusDto {
    @ApiProperty({ 
        description: 'Danh sách ID của Jig Details cần cập nhật',
        type: [String]
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'Phải có ít nhất 1 Jig Detail để cập nhật' })
    @IsUUID('4', { each: true, message: 'Mỗi ID phải là UUID hợp lệ' })
    jigDetailIds: string[];

    @ApiProperty({ 
        description: 'Trạng thái mới',
        enum: JigStatus
    })
    @IsEnum(JigStatus, { message: 'Trạng thái không hợp lệ' })
    status: JigStatus;

    @ApiPropertyOptional({ description: 'Ghi chú cho việc cập nhật' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ description: 'ID Location mới (nếu có)' })
    @IsOptional()
    @IsUUID()
    locationId?: string;

    @ApiPropertyOptional({ description: 'ID Line mới (nếu có)' })
    @IsOptional()
    @IsUUID()
    lineId?: string;

    @ApiPropertyOptional({ description: 'ID Vendor mới (nếu có)' })
    @IsOptional()
    @IsUUID()
    vendorId?: string;

    @ApiPropertyOptional({ 
        description: 'Có lưu vị trí hiện tại làm mặc định không', 
        default: false 
    })
    @IsOptional()
    saveAsDefault?: boolean = false;

    @ApiPropertyOptional({ 
        description: 'Có sử dụng vị trí mặc định không', 
        default: false 
    })
    @IsOptional()
    useDefault?: boolean = false;
}
