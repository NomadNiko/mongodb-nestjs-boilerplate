import { ApiProperty } from '@nestjs/swagger';
import { UserSchemaClass } from '../../users/schemas/user.schema';

export class LoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty({
    type: () => UserSchemaClass,
  })
  user: UserSchemaClass;
}
