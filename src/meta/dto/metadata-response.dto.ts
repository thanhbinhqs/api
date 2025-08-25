import { ApiProperty } from '@nestjs/swagger';

export class EnumOption {
  @ApiProperty()
  value: string;

  @ApiProperty()
  label: string;

  @ApiProperty({ required: false })
  description?: string;
}

export class DropdownOption {
  @ApiProperty()
  value: string;

  @ApiProperty()
  label: string;

  @ApiProperty({ required: false })
  disabled?: boolean;

  @ApiProperty({ required: false })
  zoneId?: string;
}

export class MetadataEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  isActive: boolean;
}

export class MetadataEnumsDto {
  @ApiProperty({ type: [EnumOption] })
  jigStatus: EnumOption[];

  @ApiProperty({ type: [EnumOption] })
  partDetailStatus: EnumOption[];

  @ApiProperty({ type: [EnumOption] })
  jigTypes: EnumOption[];

  @ApiProperty({ type: [EnumOption] })
  drawingTypes: EnumOption[];

  @ApiProperty({ type: [EnumOption] })
  drawingStatus: EnumOption[];

  @ApiProperty({ type: [EnumOption] })
  orderTypes: EnumOption[];

  @ApiProperty({ type: [EnumOption] })
  currencies: EnumOption[];

  @ApiProperty({ type: [EnumOption] })
  units: EnumOption[];
}

export class AllMetadataDto {
  @ApiProperty({ type: MetadataEnumsDto })
  enums: MetadataEnumsDto;

  @ApiProperty({ type: [MetadataEntity] })
  zones: MetadataEntity[];

  @ApiProperty({ type: [MetadataEntity] })
  lines: MetadataEntity[];

  @ApiProperty({ type: [MetadataEntity] })
  projects: MetadataEntity[];

  @ApiProperty({ type: [MetadataEntity] })
  processes: MetadataEntity[];

  @ApiProperty({ type: [MetadataEntity] })
  locations: MetadataEntity[];

  @ApiProperty({ type: [MetadataEntity] })
  vendors: MetadataEntity[];

  @ApiProperty()
  timestamp: string;
}
