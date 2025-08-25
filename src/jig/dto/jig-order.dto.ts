import { IsString, IsOptional, IsEnum, IsDateString, IsArray, ValidateNested, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JigOrderPriority } from '../entities/jig-order.entity';

export class CreateJigOrderDetailDto {
    @ApiProperty({ description: 'ID của jig detail' })
    @IsUUID()
    jigDetailId: string;

    @ApiProperty({ description: 'Số lượng yêu cầu', minimum: 1 })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({ description: 'Ghi chú cho jig detail này' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateJigOrderDto {
    @ApiProperty({ description: 'Tiêu đề đơn hàng' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Mức độ ưu tiên', enum: JigOrderPriority })
    @IsEnum(JigOrderPriority)
    priority: JigOrderPriority;

    @ApiPropertyOptional({ description: 'Ngày yêu cầu' })
    @IsOptional()
    @IsDateString()
    requestedDate?: string;

    @ApiProperty({ description: 'Ngày cần có' })
    @IsDateString()
    requiredDate: string;

    @ApiPropertyOptional({ description: 'ID vị trí giao hàng' })
    @IsOptional()
    @IsUUID()
    deliveryLocationId?: string;

    @ApiPropertyOptional({ description: 'ID line giao hàng' })
    @IsOptional()
    @IsUUID()
    deliveryLineId?: string;

    @ApiProperty({ description: 'Chi tiết các jig trong đơn hàng', type: [CreateJigOrderDetailDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateJigOrderDetailDto)
    orderDetails: CreateJigOrderDetailDto[];

    @ApiPropertyOptional({ description: 'Metadata bổ sung' })
    @IsOptional()
    metadata?: Record<string, any>;
}

export class UpdateJigOrderDto {
    @ApiPropertyOptional({ description: 'Tiêu đề đơn hàng' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Mức độ ưu tiên', enum: JigOrderPriority })
    @IsOptional()
    @IsEnum(JigOrderPriority)
    priority?: JigOrderPriority;

    @ApiPropertyOptional({ description: 'Ngày yêu cầu' })
    @IsOptional()
    @IsDateString()
    requestedDate?: string;

    @ApiPropertyOptional({ description: 'Ngày cần có' })
    @IsOptional()
    @IsDateString()
    requiredDate?: string;

    @ApiPropertyOptional({ description: 'ID vị trí giao hàng' })
    @IsOptional()
    @IsUUID()
    deliveryLocationId?: string;

    @ApiPropertyOptional({ description: 'ID line giao hàng' })
    @IsOptional()
    @IsUUID()
    deliveryLineId?: string;

    @ApiPropertyOptional({ description: 'Chi tiết các jig trong đơn hàng', type: [CreateJigOrderDetailDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateJigOrderDetailDto)
    orderDetails?: CreateJigOrderDetailDto[];

    @ApiPropertyOptional({ description: 'Metadata bổ sung' })
    @IsOptional()
    metadata?: Record<string, any>;
}

export class JigOrderQueryDto {
    @ApiPropertyOptional({ description: 'Tìm kiếm theo tiêu đề, mô tả hoặc mã đơn hàng' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Lọc theo trạng thái' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: 'Lọc theo mức độ ưu tiên' })
    @IsOptional()
    @IsString()
    priority?: string;

    @ApiPropertyOptional({ description: 'Lọc theo người yêu cầu' })
    @IsOptional()
    @IsUUID()
    requesterId?: string;

    @ApiPropertyOptional({ description: 'Lọc theo người phê duyệt' })
    @IsOptional()
    @IsUUID()
    approverId?: string;

    @ApiPropertyOptional({ description: 'Từ ngày' })
    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @ApiPropertyOptional({ description: 'Đến ngày' })
    @IsOptional()
    @IsDateString()
    toDate?: string;

    @ApiPropertyOptional({ description: 'Trang hiện tại', default: 1 })
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Số lượng mỗi trang', default: 10 })
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Sắp xếp theo field', default: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', default: 'DESC' })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class ApproveJigOrderDto {
    @ApiPropertyOptional({ description: 'Ghi chú phê duyệt' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class RejectJigOrderDto {
    @ApiProperty({ description: 'Lý do từ chối' })
    @IsString()
    rejectionReason: string;
}

export class PrepareJigOrderDto {
    @ApiPropertyOptional({ description: 'Ghi chú chuẩn bị' })
    @IsOptional()
    @IsString()
    preparationNotes?: string;

    @ApiProperty({ description: 'Chi tiết chuẩn bị', type: 'array', items: { type: 'object' } })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PrepareJigOrderDetailDto)
    preparedDetails: PrepareJigOrderDetailDto[];
}

export class PrepareJigOrderDetailDto {
    @ApiProperty({ description: 'ID của order detail' })
    @IsUUID()
    orderDetailId: string;

    @ApiProperty({ description: 'Số lượng thực tế chuẩn bị' })
    @IsNumber()
    @Min(0)
    actualQuantity: number;

    @ApiPropertyOptional({ description: 'Ghi chú' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class NotifyJigOrderDto {
    @ApiPropertyOptional({ description: 'Ghi chú thông báo' })
    @IsOptional()
    @IsString()
    notificationMessage?: string;

    @ApiPropertyOptional({ description: 'Phương thức thông báo', type: 'array', items: { type: 'string' } })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    notificationMethods?: string[];
}

export class PickupJigOrderDto {
    @ApiPropertyOptional({ description: 'Ghi chú khi nhận' })
    @IsOptional()
    @IsString()
    deliveryNotes?: string;

    @ApiPropertyOptional({ description: 'ID người nhận thực tế' })
    @IsOptional()
    @IsUUID()
    actualReceiverId?: string;
}
