import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class StatusDto {
  @ApiProperty()
  @IsNumber()
  id?: number | string;

  @ApiProperty()
  _id?: number | string;
}
