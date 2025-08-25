import { PartialType } from '@nestjs/swagger';
import { CreateJigDrawingDto } from './create-jig-drawing.dto';

export class UpdateJigDrawingDto extends PartialType(CreateJigDrawingDto) {}
