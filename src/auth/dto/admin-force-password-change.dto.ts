import { ApiProperty } from '@nestjs/swagger';

export class AdminForcePasswordChangeDto {
  @ApiProperty({ example: 'Forces password change and sends reset email' })
  message?: string;
}