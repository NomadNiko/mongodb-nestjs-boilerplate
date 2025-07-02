import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { ConversationSchemaClass, ConversationSchema } from './schemas/conversation.schema';
import { MessageSchemaClass, MessageSchema } from './schemas/message.schema';

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
    ]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}