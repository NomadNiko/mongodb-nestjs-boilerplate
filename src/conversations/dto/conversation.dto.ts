import { ApiProperty } from '@nestjs/swagger';
import { UserSchemaClass } from '../../users/schemas/user.schema';

export class ConversationDto {
  @ApiProperty({ 
    type: String,
    description: 'Unique identifier for the conversation',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @ApiProperty({
    type: [UserSchemaClass],
    description: 'Users participating in the conversation',
  })
  participants: UserSchemaClass[];

  @ApiProperty({
    type: String,
    description: 'Optional name for the conversation',
    example: 'Team Discussion',
    required: false,
  })
  name?: string;

  @ApiProperty({
    type: Date,
    description: 'Timestamp of the last message',
    example: '2025-07-02T10:30:00Z',
  })
  lastMessageAt: Date;

  @ApiProperty({
    type: Date,
    description: 'When the conversation was created',
    example: '2025-07-01T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date, 
    description: 'When the conversation was last updated',
    example: '2025-07-02T10:30:00Z',
  })
  updatedAt: Date;
}