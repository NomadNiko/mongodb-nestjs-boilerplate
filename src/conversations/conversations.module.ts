import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { ConversationSchemaClass, ConversationSchema } from './schemas/conversation.schema';
import { MessageSchemaClass, MessageSchema } from './schemas/message.schema';
import { UserSchemaClass, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ConversationSchemaClass.name,
        schema: ConversationSchema,
      },
      {
        name: MessageSchemaClass.name,
        schema: MessageSchema,
      },
      {
        name: UserSchemaClass.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}