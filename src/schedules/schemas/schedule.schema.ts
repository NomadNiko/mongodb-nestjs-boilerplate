import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { UserSchemaClass } from '../../users/schemas/user.schema';

export type ScheduleSchemaDocument = HydratedDocument<ScheduleSchemaClass>;

export enum ScheduleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class ScheduleSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: Date,
    required: true,
  })
  startDate: Date;

  @Prop({
    type: Date,
    required: true,
  })
  endDate: Date;

  @Prop({
    type: String,
    enum: ScheduleStatus,
    default: ScheduleStatus.DRAFT,
  })
  status: ScheduleStatus;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
  })
  createdBy: Types.ObjectId;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const ScheduleSchema = SchemaFactory.createForClass(ScheduleSchemaClass);

// Create indexes for performance
ScheduleSchema.index({ status: 1 });
ScheduleSchema.index({ startDate: 1, endDate: 1 });
ScheduleSchema.index({ createdBy: 1 });