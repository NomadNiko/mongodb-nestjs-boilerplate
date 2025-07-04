import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from 'src/utils/document-entity-helper';
import { UserSchemaClass } from 'src/users/schemas/user.schema';

export enum TimeClockStatus {
  CLOCKED_IN = 'CLOCKED_IN',
  CLOCKED_OUT = 'CLOCKED_OUT',
}

export type TimeClockEntrySchemaDocument = HydratedDocument<TimeClockEntrySchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class TimeClockEntrySchemaClass extends EntityDocumentHelper {
  @Prop({ type: Types.ObjectId, ref: UserSchemaClass.name, required: true, index: true })
  employee: Types.ObjectId;

  @Prop({ type: Date, required: true, index: true })
  clockInTime: Date;

  @Prop({ type: Date, default: null, index: true })
  clockOutTime: Date | null;

  @Prop({ type: Number, default: 0 })
  totalMinutes: number;

  @Prop({ type: String, enum: TimeClockStatus, default: TimeClockStatus.CLOCKED_IN, index: true })
  status: TimeClockStatus;

  @Prop({ type: String, maxlength: 500 })
  notes?: string;

  // Virtual for total hours (computed from totalMinutes)
  get totalHours(): number {
    return this.totalMinutes / 60;
  }

  // Virtual for duration display
  get durationDisplay(): string {
    if (this.totalMinutes === 0) return '0h 0m';
    const hours = Math.floor(this.totalMinutes / 60);
    const minutes = this.totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  // Virtual for current session duration (if still clocked in)
  get currentSessionMinutes(): number {
    if (this.status === TimeClockStatus.CLOCKED_IN && this.clockInTime) {
      const now = new Date();
      return Math.floor((now.getTime() - this.clockInTime.getTime()) / (1000 * 60));
    }
    return this.totalMinutes;
  }
}

export const TimeClockEntrySchema = SchemaFactory.createForClass(TimeClockEntrySchemaClass);

// Indexes for performance
TimeClockEntrySchema.index({ employee: 1, clockInTime: -1 });
TimeClockEntrySchema.index({ employee: 1, status: 1 });
TimeClockEntrySchema.index({ clockInTime: 1 });
TimeClockEntrySchema.index({ status: 1 });
TimeClockEntrySchema.index({ employee: 1, clockInTime: 1, clockOutTime: 1 });

// Ensure only one CLOCKED_IN entry per employee
TimeClockEntrySchema.index(
  { employee: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: TimeClockStatus.CLOCKED_IN }
  }
);

export { TimeClockEntrySchemaDocument as TimeClockEntryDocument };