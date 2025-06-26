import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max, Matches } from 'class-validator';

export class CreateShiftTypeDto {
  @ApiProperty({ 
    example: 'Front Desk Morning',
    description: 'Name of the shift type'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ 
    example: '06:00',
    description: 'Start time in HH:MM format'
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format'
  })
  startTime: string;

  @ApiProperty({ 
    example: '10:00',
    description: 'End time in HH:MM format (supports overnight shifts like 22:00-04:00)'
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format'
  })
  endTime: string;

  @ApiProperty({ 
    example: 1,
    description: 'Color index (0-9) for theme-based color mapping',
    minimum: 0,
    maximum: 9,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9)
  colorIndex?: number;
}