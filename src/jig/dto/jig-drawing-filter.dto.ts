import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class JigDrawingFilterDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên bản vẽ' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID Jig' })
  @IsOptional()
  @IsUUID()
  jigId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo loại bản vẽ' })
  @IsOptional()
  @IsString()
  drawingType?: string;

  @ApiPropertyOptional({ description: 'Lọc theo định dạng file' })
  @IsOptional()
  @IsString()
  fileFormat?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Lọc theo phiên bản' })
  @IsOptional()
  @IsString()
  drawingVersion?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo số bản vẽ' })
  @IsOptional()
  @IsString()
  drawingNumber?: string;

  @ApiPropertyOptional({ description: 'Lọc theo revision' })
  @IsOptional()
  @IsString()
  revision?: string;

  @ApiPropertyOptional({ description: 'Từ ngày tạo' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({ description: 'Đến ngày tạo' })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({ description: 'Số trang', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số bản ghi trên trang', default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sắp xếp theo trường' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Hướng sắp xếp', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
