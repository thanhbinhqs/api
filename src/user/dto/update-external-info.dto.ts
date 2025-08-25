import { ApiProperty } from '@nestjs/swagger';

export class UpdateExternalInfoDto {
  @ApiProperty({ description: 'External info data to be encrypted' })
  data: any;
}
