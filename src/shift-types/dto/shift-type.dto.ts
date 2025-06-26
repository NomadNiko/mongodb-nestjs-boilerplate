import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ShiftTypeDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id?.toString())
  id: string;

  @ApiProperty({ example: 'Front Desk Morning' })
  @Expose()
  name: string;

  @ApiProperty({ example: '06:00' })
  @Expose()
  startTime: string;

  @ApiProperty({ example: '10:00' })
  @Expose()
  endTime: string;

  @ApiProperty({ example: 1 })
  @Expose()
  colorIndex: number;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}