import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { JigStatus } from '../entities/jig-detail.entity';

export class CreateJigDetailDto {
    @IsNotEmpty()
    @IsString()
    jigId: string;

    @IsNotEmpty()
    @IsString()
    code: string;

    @IsOptional()
    @IsString()
    mesCode?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(JigStatus)
    status?: JigStatus = JigStatus.NEW;

    @IsOptional()
    @IsString()
    locationId?: string;

    @IsOptional()
    @IsString()
    lineId?: string;

    @IsOptional()
    @IsString()
    vendorId?: string;

    @IsOptional()
    @IsDateString()
    lastMaintenanceDate?: Date;
}
