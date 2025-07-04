import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';

export class TimeClockQueryDto {
  @ApiProperty({
    description: 'Start date for the query period (YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value).toISOString().split('T')[0] : undefined)
  startDate?: string;

  @ApiProperty({
    description: 'End date for the query period (YYYY-MM-DD)',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value).toISOString().split('T')[0] : undefined)
  endDate?: string;

  @ApiProperty({
    description: 'Employee ID to filter by (admin only)',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10) || 1)
  page?: number;

  @ApiProperty({
    description: 'Number of records per page',
    example: 50,
    required: false,
    default: 50,
  })
  @IsOptional()
  @Transform(({ value }) => Math.min(parseInt(value, 10) || 50, 100))
  limit?: number;
}