import { ApiProperty } from '@nestjs/swagger';
import { UserSchemaClass } from '../../users/schemas/user.schema';

export class MessageDto {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the message',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'ID of the conversation this message belongs to',
    example: '507f1f77bcf86cd799439012'
  })
  conversationId: string;

  @ApiProperty({
    type: UserSchemaClass,
    description: 'User who sent the message',
  })
  sender: UserSchemaClass;

  @ApiProperty({
    type: String,
    description: 'Content of the message',
    example: 'Hello everyone! How is the schedule for tomorrow?'
  })
  content: string;

  @ApiProperty({
    type: Date,
    description: 'When the message was sent',
    example: '2025-07-02T10:30:00Z'
  })
  timestamp: Date;

  @ApiProperty({
    type: Date,
    description: 'When the message was created',
    example: '2025-07-02T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'When the message was last updated',
    example: '2025-07-02T10:30:00Z'
  })
  updatedAt: Date;
}