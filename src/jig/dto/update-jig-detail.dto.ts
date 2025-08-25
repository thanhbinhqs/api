import { PartialType } from '@nestjs/swagger';
import { CreateJigDetailDto } from './create-jig-detail.dto';

export class UpdateJigDetailDto extends PartialType(CreateJigDetailDto) {}
