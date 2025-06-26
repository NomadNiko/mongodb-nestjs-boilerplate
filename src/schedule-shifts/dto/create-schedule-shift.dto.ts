import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateScheduleShiftDto {
  @ApiProperty({ 
    example: '64a7b8c9d0e1f2345678901a',
    description: 'ID of the shift type to create'
  })
  @IsNotEmpty()
  @IsString()
  shiftTypeId: string;

  @ApiProperty({ 
    example: '2024-01-15',
    description: 'Date for the shift'
  })
  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString().split('T')[0])
  date: string;

  @ApiProperty({ 
    example: 1,
    description: 'Timeline order for shifts on the same day',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  order?: number;
}