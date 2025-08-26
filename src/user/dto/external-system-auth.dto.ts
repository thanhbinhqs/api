import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExternalSystemAuthDto {
  @IsString()
  systemName: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  expiresAt?: Date;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateExternalSystemAuthDto extends CreateExternalSystemAuthDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSystemStatusDto {
  @IsBoolean()
  isActive: boolean;
}

export class ClearNotificationsDto {
  @IsOptional()
  @IsString()
  systemName?: string;
}
