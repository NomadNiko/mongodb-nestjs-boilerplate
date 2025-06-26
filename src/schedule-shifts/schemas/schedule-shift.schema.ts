import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { ScheduleSchemaClass } from '../../schedules/schemas/schedule.schema';
import { ShiftTypeSchemaClass } from '../../shift-types/schemas/shift-type.schema';
import { UserSchemaClass } from '../../users/schemas/user.schema';

export type ScheduleShiftSchemaDocument = HydratedDocument<ScheduleShiftSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class ScheduleShiftSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: ScheduleSchemaClass.name,
    required: true,
  })
  scheduleId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: ShiftTypeSchemaClass.name,
    required: true,
  })
  shiftTypeId: Types.ObjectId;

  @Prop({
    type: Date,
    required: true,
  })
  date: Date;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    default: null,
  })
  userId: Types.ObjectId | null;

  @Prop({
    type: Number,
    default: 1,
  })
  order: number;

  @Prop({
    type: Boolean,
    default: false,
  })
  isActive: boolean;

  @Prop({
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'actualStartTime must be in HH:MM format'
    }
  })
  actualStartTime?: string;

  @Prop({
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'actualEndTime must be in HH:MM format'
    }
  })
  actualEndTime?: string;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const ScheduleShiftSchema = SchemaFactory.createForClass(ScheduleShiftSchemaClass);

// Create indexes for performance
ScheduleShiftSchema.index({ scheduleId: 1, date: 1 });
ScheduleShiftSchema.index({ userId: 1, date: 1 });
ScheduleShiftSchema.index({ shiftTypeId: 1 });
ScheduleShiftSchema.index({ isActive: 1 });