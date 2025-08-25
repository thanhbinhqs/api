import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShareDto {
  @ApiProperty({
    required: false,
    description: 'Password to protect the shared file',
    example: 'secret123',
    type: String
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    required: false,
    description: 'Expiration date of the share link (ISO format)',
    example: '2025-12-31T23:59:59Z',
    type: Date
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiProperty({
    required: false,
    description: 'Maximum number of downloads allowed',
    example: 10,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  maxDownloads?: number;
}
