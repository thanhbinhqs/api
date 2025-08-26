import { IsString, IsOptional, Length } from 'class-validator';

export class CreateZoneDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsString()
  @Length(2, 50)
  slug: string;

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
