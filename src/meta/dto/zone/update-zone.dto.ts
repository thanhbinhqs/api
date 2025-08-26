import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateZoneDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  slug?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  code?: string;

  @IsOptional()
  @IsString()
  parentZoneId?: string;
}
