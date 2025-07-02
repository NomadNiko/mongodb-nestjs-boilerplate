import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    type: String,
    description: 'Content of the message',
    example: 'Hello everyone! How is the schedule for tomorrow?',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}