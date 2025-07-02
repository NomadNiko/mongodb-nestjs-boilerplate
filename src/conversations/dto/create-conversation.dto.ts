import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ArrayMinSize } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    type: [String],
    description: 'Array of user IDs to include in the conversation',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Type(() => String)
  participantIds: string[];

  @ApiProperty({
    type: String,
    description: 'Optional name for the conversation/group',
    example: 'Team Discussion',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}