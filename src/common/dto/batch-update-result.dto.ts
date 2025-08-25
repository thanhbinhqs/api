import { ApiProperty } from '@nestjs/swagger';

export class BatchUpdateResultDto {
    @ApiProperty({ 
        description: 'Danh sách ID đã cập nhật thành công',
        type: [String]
    })
    success: string[];

    @ApiProperty({ 
        description: 'Danh sách ID cập nhật thất bại và lý do',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                error: { type: 'string' }
            }
        }
    })
    failed: { id: string; error: string }[];

    @ApiProperty({ description: 'Tổng số bản ghi được xử lý' })
    total: number;

    @ApiProperty({ description: 'Số bản ghi thành công' })
    successCount: number;

    @ApiProperty({ description: 'Số bản ghi thất bại' })
    failedCount: number;
}
