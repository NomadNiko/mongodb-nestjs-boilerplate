import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeClockEntriesService } from './time-clock-entries.service';
import { TimeClockEntriesController } from './time-clock-entries.controller';
import { TimeClockEntrySchemaClass, TimeClockEntrySchema } from './schemas/time-clock-entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimeClockEntrySchemaClass.name, schema: TimeClockEntrySchema },
    ]),
  ],
  controllers: [TimeClockEntriesController],
  providers: [TimeClockEntriesService],
  exports: [TimeClockEntriesService],
})
export class TimeClockEntriesModule {}