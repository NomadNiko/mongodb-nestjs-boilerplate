import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CopyPreviousResponseDto {
  @ApiProperty({ example: 'Shifts copied successfully' })
  @Expose()
  message: string;

  @ApiProperty({ example: 25 })
  @Expose()
  count: number;
}