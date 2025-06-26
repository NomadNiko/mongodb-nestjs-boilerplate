import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateShiftTimesDto {
  @ApiProperty({ 
    example: '06:15',
    description: 'Actual start time (can differ from shift type template)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'actualStartTime must be in HH:MM format'
  })
  actualStartTime?: string;

  @ApiProperty({ 
    example: '10:30',
    description: 'Actual end time (can differ from shift type template)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'actualEndTime must be in HH:MM format'
  })
  actualEndTime?: string;
}