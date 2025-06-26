import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateScheduleShiftDto {
  @ApiProperty({ 
    example: '64a7b8c9d0e1f2345678901b',
    description: 'User ID to assign to this shift (null to unassign)',
    required: false
  })
  @IsOptional()
  @IsString()
  userId?: string | null;

  @ApiProperty({ 
    example: 2,
    description: 'New timeline order for this shift',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  order?: number;
}