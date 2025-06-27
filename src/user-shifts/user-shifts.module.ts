import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserShiftsController } from './user-shifts.controller';
import { UserShiftsService } from './user-shifts.service';
import { ScheduleShiftSchema, ScheduleShiftSchemaClass } from '../schedule-shifts/schemas/schedule-shift.schema';
import { ScheduleSchema, ScheduleSchemaClass } from '../schedules/schemas/schedule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduleShiftSchemaClass.name, schema: ScheduleShiftSchema },
      { name: ScheduleSchemaClass.name, schema: ScheduleSchema },
    ]),
  ],
  controllers: [UserShiftsController],
  providers: [UserShiftsService],
  exports: [UserShiftsService],
})
export class UserShiftsModule {}