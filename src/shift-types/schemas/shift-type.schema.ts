import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type ShiftTypeSchemaDocument = HydratedDocument<ShiftTypeSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class ShiftTypeSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'startTime must be in HH:MM format'
    }
  })
  startTime: string;

  @Prop({
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'endTime must be in HH:MM format'
    }
  })
  endTime: string;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
    max: 9,
  })
  colorIndex: number;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const ShiftTypeSchema = SchemaFactory.createForClass(ShiftTypeSchemaClass);

// Create indexes for performance
ShiftTypeSchema.index({ isActive: 1 });
ShiftTypeSchema.index({ name: 1 });