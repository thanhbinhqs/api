import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    required: false,
    description: 'Index of the current chunk (0-based)',
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  chunkIndex?: number;

  @ApiProperty({
    required: false,
    description: 'Total number of chunks for the file',
    minimum: 1,
    example: 5,
  })
  @IsOptional()
  totalChunks?: number;

  @ApiProperty({
    required: false,
    description:
      'File ID. Received after first chunk upload. Used to identify the file in subsequent chunk uploads.',
  })
  @IsOptional()
  fileId?: string;

  @ApiProperty({
    required: false,
    description: 'Resume chunk check value. ',
  })
  @IsOptional()
  resumeCheck?: number;

  @ApiProperty({
    required: false,
    description: 'FileName ',
  })
  @IsOptional()
  fileName?: string;

  @ApiProperty({
    required: false,
    description: 'File Size ',
  })
  @IsOptional()
  fileSize?: string;
}
