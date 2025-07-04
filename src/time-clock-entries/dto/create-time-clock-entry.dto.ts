import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTimeClockEntryDto {
  @ApiProperty({
    description: 'Optional notes for the clock-in',
    example: 'Starting morning shift',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}