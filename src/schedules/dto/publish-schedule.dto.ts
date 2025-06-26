import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ScheduleStatus } from '../schemas/schedule.schema';

export class PublishScheduleDto {
  @ApiProperty({ 
    enum: ScheduleStatus,
    example: ScheduleStatus.PUBLISHED,
    description: 'Status to set for the schedule'
  })
  @IsEnum(ScheduleStatus)
  status: ScheduleStatus;
}