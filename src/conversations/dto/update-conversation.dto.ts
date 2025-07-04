import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateConversationDto {
  @ApiProperty({
    type: String,
    description: 'Optional name/title for the conversation',
    example: 'Updated Team Discussion',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}