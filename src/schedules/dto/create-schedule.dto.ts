import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateScheduleDto {
  @ApiProperty({ 
    example: 'Week of January 15-21, 2024',
    description: 'Name of the schedule'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ 
    example: '2024-01-15',
    description: 'Start date of the schedule (usually Monday of the week)'
  })
  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString().split('T')[0])
  startDate: string;

  @ApiProperty({ 
    example: '2024-01-21',
    description: 'End date of the schedule (usually Sunday of the week)'
  })
  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString().split('T')[0])
  endDate: string;
}