import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTimeClockEntryDto {
  @ApiProperty({
    description: 'Optional notes for the clock-out',
    example: 'Completed evening shift',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}