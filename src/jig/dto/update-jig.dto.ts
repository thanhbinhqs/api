import { PartialType } from '@nestjs/swagger';
import { CreateJigDto } from './create-jig.dto';

export class UpdateJigDto extends PartialType(CreateJigDto) {}
