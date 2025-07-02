import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { UserSchemaClass } from '../../users/schemas/user.schema';
import { ConversationSchemaClass } from './conversation.schema';

export type MessageSchemaDocument = HydratedDocument<MessageSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class MessageSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: ConversationSchemaClass.name,
    required: true,
  })
  conversationId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
  })
  senderId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: Date,
    default: now,
  })
  timestamp: Date;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(MessageSchemaClass);

// Create indexes for performance
MessageSchema.index({ conversationId: 1, timestamp: -1 });
MessageSchema.index({ senderId: 1 });