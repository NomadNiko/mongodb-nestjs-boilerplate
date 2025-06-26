import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ScheduleStatus } from '../schemas/schedule.schema';

export class QueryScheduleDto {
  @ApiPropertyOptional({ 
    enum: ScheduleStatus,
    description: 'Filter by schedule status'
  })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : 1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : 10)
  limit?: number = 10;
}