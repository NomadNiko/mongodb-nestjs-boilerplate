import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ShiftPatternDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @Expose()
  shiftTypeId: string;

  @ApiProperty({ example: '2024-01-15' })
  @Expose()
  date: string;

  @ApiProperty({ example: 1 })
  @Expose()
  order: number;
}

export class CopyPreviousResponseDto {
  @ApiProperty({ example: 'Found 25 shifts to copy from previous schedule' })
  @Expose()
  message: string;

  @ApiProperty({ example: 25 })
  @Expose()
  count: number;

  @ApiProperty({ 
    type: [ShiftPatternDto],
    description: 'Array of shift patterns to create locally'
  })
  @Expose()
  shiftsToCreate: ShiftPatternDto[];

  @ApiProperty({ example: 'Week of June 23-June 29, 2025' })
  @Expose()
  sourceScheduleName: string;
}