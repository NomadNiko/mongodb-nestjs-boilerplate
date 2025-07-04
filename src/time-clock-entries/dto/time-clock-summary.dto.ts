import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { TimeClockEntryDto, TimeClockEntryEmployeeDto } from './time-clock-entry.dto';

// Re-export TimeClockStatusDto
export { TimeClockStatusDto } from './time-clock-status.dto';

export class ActiveEmployeeDto {
  @ApiProperty({ type: TimeClockEntryEmployeeDto })
  @Expose()
  @Type(() => TimeClockEntryEmployeeDto)
  employee: TimeClockEntryEmployeeDto;

  @ApiProperty({ example: '2024-01-15T09:00:00.000Z' })
  @Expose()
  clockedInAt: Date;

  @ApiProperty({ example: 145, description: 'Minutes since clocked in' })
  @Expose()
  currentSessionMinutes: number;

  @ApiProperty({ example: '2h 25m', description: 'Human-readable session duration' })
  @Expose()
  currentSessionDisplay: string;

  @ApiProperty({ example: 'Started morning shift' })
  @Expose()
  notes?: string;
}

export class TimeClockSummaryDto {
  @ApiProperty({ example: 5, description: 'Total number of employees currently clocked in' })
  @Expose()
  totalActiveClockedIn: number;

  @ApiProperty({ type: [ActiveEmployeeDto], description: 'List of currently clocked in employees' })
  @Expose()
  @Type(() => ActiveEmployeeDto)
  activeEmployees: ActiveEmployeeDto[];

  @ApiProperty({ example: 1200, description: 'Total minutes worked by all employees in the period' })
  @Expose()
  totalMinutesWorked: number;

  @ApiProperty({ example: 20, description: 'Total hours worked by all employees in the period' })
  @Expose()
  totalHoursWorked: number;

  @ApiProperty({ example: 25, description: 'Total number of time entries in the period' })
  @Expose()
  totalEntries: number;

  @ApiProperty({ example: 20, description: 'Total number of completed entries in the period' })
  @Expose()
  completedEntries: number;

  @ApiProperty({ example: 5, description: 'Total number of ongoing entries (still clocked in)' })
  @Expose()
  ongoingEntries: number;
}

export class EmployeeTimeClockSummaryDto {
  @ApiProperty({ type: TimeClockEntryEmployeeDto })
  @Expose()
  @Type(() => TimeClockEntryEmployeeDto)
  employee: TimeClockEntryEmployeeDto;

  @ApiProperty({ example: 480, description: 'Total minutes worked in the period' })
  @Expose()
  totalMinutesWorked: number;

  @ApiProperty({ example: 8, description: 'Total hours worked in the period' })
  @Expose()
  totalHoursWorked: number;

  @ApiProperty({ example: 5, description: 'Total number of time entries in the period' })
  @Expose()
  totalEntries: number;

  @ApiProperty({ example: 4, description: 'Total number of completed entries in the period' })
  @Expose()
  completedEntries: number;

  @ApiProperty({ example: 1, description: 'Total number of ongoing entries (still clocked in)' })
  @Expose()
  ongoingEntries: number;

  @ApiProperty({ example: true, description: 'Whether the employee is currently clocked in' })
  @Expose()
  currentlyClockedIn: boolean;

  @ApiProperty({ 
    example: '2024-01-15T14:30:00.000Z', 
    description: 'When the employee clocked in (if currently clocked in)',
    nullable: true 
  })
  @Expose()
  currentClockInTime?: Date;

  @ApiProperty({ 
    example: 90, 
    description: 'Current session minutes (if currently clocked in)',
    nullable: true 
  })
  @Expose()
  currentSessionMinutes?: number;
}