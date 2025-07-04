import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { TimeClockStatus } from '../schemas/time-clock-entry.schema';
import { TimeClockEntryDto } from './time-clock-entry.dto';

export class TimeClockStatusDto {
  @ApiProperty({ 
    enum: TimeClockStatus, 
    example: TimeClockStatus.CLOCKED_IN,
    description: 'Current status of the user' 
  })
  @Expose()
  status: TimeClockStatus;

  @ApiProperty({ 
    example: true, 
    description: 'Whether the user is currently clocked in' 
  })
  @Expose()
  isClockedIn: boolean;

  @ApiProperty({ 
    type: TimeClockEntryDto,
    description: 'Current active time clock entry (if clocked in)',
    nullable: true 
  })
  @Expose()
  @Type(() => TimeClockEntryDto)
  currentEntry?: TimeClockEntryDto;

  @ApiProperty({ 
    example: 145, 
    description: 'Current session duration in minutes (if clocked in)',
    nullable: true 
  })
  @Expose()
  currentSessionMinutes?: number;

  @ApiProperty({ 
    example: '2h 25m', 
    description: 'Current session duration display (if clocked in)',
    nullable: true 
  })
  @Expose()
  currentSessionDisplay?: string;

  @ApiProperty({ 
    example: '2024-01-15T09:00:00.000Z', 
    description: 'When the user clocked in (if clocked in)',
    nullable: true 
  })
  @Expose()
  clockedInAt?: Date;
}