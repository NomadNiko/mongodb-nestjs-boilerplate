import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsMongoId } from 'class-validator';

export class AddParticipantDto {
  @ApiProperty({
    description: 'The ID of the user to add to the conversation',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsMongoId()
  participantId: string;
}