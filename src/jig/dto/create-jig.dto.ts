import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateJigDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  mesCode?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  processId?: string;

  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsNumber()
  stdQuantity?: number = 0;

  @IsOptional()
  @IsBoolean()
  needMaintenance?: boolean = false;

  @IsOptional()
  @IsNumber()
  maintenanceInterval?: number = 30;

  @IsOptional()
  @IsString()
  type?: string = 'mechanical';

  @IsOptional()
  @IsBoolean()
  hasPart?: boolean = false;
}
