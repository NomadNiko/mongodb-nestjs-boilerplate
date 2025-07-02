import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { UserSchemaClass } from '../../users/schemas/user.schema';

export type ConversationSchemaDocument = HydratedDocument<ConversationSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class ConversationSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: [{ type: Types.ObjectId, ref: UserSchemaClass.name }],
    required: true,
  })
  participants: Types.ObjectId[];

  @Prop({
    type: String,
    required: false,
  })
  name?: string;

  @Prop({
    type: Date,
    default: now,
  })
  lastMessageAt: Date;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(ConversationSchemaClass);

// Create indexes for performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });