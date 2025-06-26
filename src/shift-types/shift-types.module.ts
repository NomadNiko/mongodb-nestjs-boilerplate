import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShiftTypesService } from './shift-types.service';
import { ShiftTypesController } from './shift-types.controller';
import { ShiftTypeSchemaClass, ShiftTypeSchema } from './schemas/shift-type.schema';
import { ScheduleShiftSchemaClass, ScheduleShiftSchema } from '../schedule-shifts/schemas/schedule-shift.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShiftTypeSchemaClass.name, schema: ShiftTypeSchema },
      { name: ScheduleShiftSchemaClass.name, schema: ScheduleShiftSchema },
    ]),
  ],
  controllers: [ShiftTypesController],
  providers: [ShiftTypesService],
  exports: [ShiftTypesService],
})
export class ShiftTypesModule {}