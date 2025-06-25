import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class AuthAcceptInviteDto {
  @ApiProperty()
  @IsNotEmpty()
  hash: string;

  @ApiProperty()
  @MinLength(6)
  password: string;
}