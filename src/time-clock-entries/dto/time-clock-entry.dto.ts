import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { TimeClockStatus } from '../schemas/time-clock-entry.schema';

export class TimeClockEntryEmployeeDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @Expose()
  _id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'John' })
  @Expose()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @Expose()
  lastName?: string;

  @ApiProperty({ example: 5 })
  @Expose()
  avatar?: number;
}

export class TimeClockEntryDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @Expose()
  _id: string;

  @ApiProperty({ type: TimeClockEntryEmployeeDto })
  @Expose()
  @Type(() => TimeClockEntryEmployeeDto)
  employee: TimeClockEntryEmployeeDto;

  @ApiProperty({ example: '2024-01-15T09:00:00.000Z' })
  @Expose()
  clockInTime: Date;

  @ApiProperty({ 
    example: '2024-01-15T17:00:00.000Z', 
    description: 'null if still clocked in',
    nullable: true 
  })
  @Expose()
  clockOutTime: Date | null;

  @ApiProperty({ example: 480, description: 'Total minutes worked' })
  @Expose()
  totalMinutes: number;

  @ApiProperty({ example: 8, description: 'Total hours worked (computed)' })
  @Expose()
  totalHours: number;

  @ApiProperty({ example: '8h 0m', description: 'Human-readable duration' })
  @Expose()
  durationDisplay: string;

  @ApiProperty({ 
    example: 480, 
    description: 'Current session minutes (live if clocked in, total if clocked out)' 
  })
  @Expose()
  currentSessionMinutes: number;

  @ApiProperty({ 
    enum: TimeClockStatus, 
    example: TimeClockStatus.CLOCKED_OUT 
  })
  @Expose()
  status: TimeClockStatus;

  @ApiProperty({ 
    example: 'Completed morning shift', 
    description: 'Optional notes',
    required: false 
  })
  @Expose()
  notes?: string;

  @ApiProperty({ example: '2024-01-15T09:00:00.000Z' })
  @Expose()
  createdAt?: Date;

  @ApiProperty({ example: '2024-01-15T17:00:00.000Z' })
  @Expose()
  updatedAt?: Date;
}