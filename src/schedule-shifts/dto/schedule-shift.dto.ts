import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { ShiftTypeDto } from '../../shift-types/dto/shift-type.dto';

export class ScheduleShiftUserDto {
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

  @ApiProperty()
  @Expose()
  role: string;
}

export class ScheduleShiftDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id?.toString())
  id: string;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.scheduleId?.toString())
  scheduleId: string;

  @ApiProperty({ type: ShiftTypeDto })
  @Expose()
  @Type(() => ShiftTypeDto)
  shiftType: ShiftTypeDto;

  @ApiProperty()
  @Expose()
  date: Date;

  @ApiProperty({ type: ScheduleShiftUserDto, nullable: true })
  @Expose()
  @Type(() => ScheduleShiftUserDto)
  user?: ScheduleShiftUserDto | null;

  @ApiProperty()
  @Expose()
  order: number;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty({ required: false })
  @Expose()
  actualStartTime?: string;

  @ApiProperty({ required: false })
  @Expose()
  actualEndTime?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class ScheduleShiftsResponseDto {
  @ApiProperty({ type: [ScheduleShiftDto] })
  @Expose()
  @Type(() => ScheduleShiftDto)
  shifts: ScheduleShiftDto[];

  @ApiProperty({ type: [ScheduleShiftDto] })
  @Expose()
  @Type(() => ScheduleShiftDto)
  unassignedShifts: ScheduleShiftDto[];
}