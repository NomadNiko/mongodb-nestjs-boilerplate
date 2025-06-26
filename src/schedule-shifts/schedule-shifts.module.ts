import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleShiftsService } from './schedule-shifts.service';
import { ScheduleShiftsController } from './schedule-shifts.controller';
import { ScheduleShiftSchemaClass, ScheduleShiftSchema } from './schemas/schedule-shift.schema';
import { ScheduleSchemaClass, ScheduleSchema } from '../schedules/schemas/schedule.schema';
import { ShiftTypeSchemaClass, ShiftTypeSchema } from '../shift-types/schemas/shift-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduleShiftSchemaClass.name, schema: ScheduleShiftSchema },
      { name: ScheduleSchemaClass.name, schema: ScheduleSchema },
      { name: ShiftTypeSchemaClass.name, schema: ShiftTypeSchema },
    ]),
  ],
  controllers: [ScheduleShiftsController],
  providers: [ScheduleShiftsService],
  exports: [ScheduleShiftsService],
})
export class ScheduleShiftsModule {}