import { IsString, IsOptional, IsNumber, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJigDrawingDto {
    @ApiProperty({ description: 'Tên bản vẽ' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Mô tả bản vẽ' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Tên file' })
    @IsString()
    fileName: string;

    @ApiProperty({ description: 'Đường dẫn file' })
    @IsString()
    filePath: string;

    @ApiProperty({ description: 'Kích thước file (bytes)' })
    @IsNumber()
    fileSize: number;

    @ApiProperty({ description: 'Loại MIME' })
    @IsString()
    mimeType: string;

    @ApiPropertyOptional({ description: 'Phiên bản bản vẽ', default: '1.0' })
    @IsOptional()
    @IsString()
    drawingVersion?: string;

    @ApiPropertyOptional({ description: 'Loại bản vẽ', default: 'assembly' })
    @IsOptional()
    @IsString()
    drawingType?: string;

    @ApiProperty({ description: 'Định dạng file' })
    @IsString()
    fileFormat: string;

    @ApiPropertyOptional({ description: 'Ngày phê duyệt' })
    @IsOptional()
    @IsDateString()
    approvedAt?: string;

    @ApiPropertyOptional({ description: 'Người phê duyệt' })
    @IsOptional()
    @IsString()
    approvedBy?: string;

    @ApiPropertyOptional({ description: 'Trạng thái', default: 'draft' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: 'Ghi chú' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ description: 'Số bản vẽ' })
    @IsOptional()
    @IsString()
    drawingNumber?: string;

    @ApiPropertyOptional({ description: 'Revision', default: 'A' })
    @IsOptional()
    @IsString()
    revision?: string;

    @ApiPropertyOptional({ description: 'Đường dẫn thumbnail' })
    @IsOptional()
    @IsString()
    thumbnailPath?: string;

    @ApiProperty({ description: 'ID của Jig' })
    @IsUUID()
    jigId: string;
}
