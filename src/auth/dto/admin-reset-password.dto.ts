import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}