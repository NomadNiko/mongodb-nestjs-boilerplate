import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { ScheduleStatus } from '../schemas/schedule.schema';

export class ScheduleCreatedByDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id?.toString())
  id: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;
}

export class ScheduleDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id?.toString())
  id: string;

  @ApiProperty({ example: 'Week of January 15-21, 2024' })
  @Expose()
  name: string;

  @ApiProperty({ example: '2024-01-15T00:00:00Z' })
  @Expose()
  startDate: Date;

  @ApiProperty({ example: '2024-01-21T23:59:59Z' })
  @Expose()
  endDate: Date;

  @ApiProperty({ enum: ScheduleStatus, example: ScheduleStatus.DRAFT })
  @Expose()
  status: ScheduleStatus;

  @ApiProperty({ type: ScheduleCreatedByDto })
  @Expose()
  @Type(() => ScheduleCreatedByDto)
  createdBy: ScheduleCreatedByDto;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}