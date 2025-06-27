import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScheduleShiftSchemaClass, ScheduleShiftSchemaDocument } from '../schedule-shifts/schemas/schedule-shift.schema';
import { ScheduleSchemaClass, ScheduleSchemaDocument } from '../schedules/schemas/schedule.schema';
import { ScheduleShiftDto } from '../schedule-shifts/dto/schedule-shift.dto';

@Injectable()
export class UserShiftsService {
  constructor(
    @InjectModel(ScheduleShiftSchemaClass.name)
    private readonly scheduleShiftModel: Model<ScheduleShiftSchemaDocument>,
    @InjectModel(ScheduleSchemaClass.name)
    private readonly scheduleModel: Model<ScheduleSchemaDocument>,
  ) {}

  async getUserShifts(userId: string): Promise<ScheduleShiftDto[]> {
    // Get all published schedules
    const publishedSchedules = await this.scheduleModel
      .find({ status: 'published' })
      .exec();

    const scheduleIds = publishedSchedules.map(schedule => schedule._id.toString());

    // Get all shifts for the user across all published schedules
    const userShifts = await this.scheduleShiftModel
      .find({ 
        scheduleId: { $in: scheduleIds },
        userId: userId 
      })
      .populate('shiftTypeId')
      .populate('userId', 'firstName lastName role')
      .sort({ date: -1 }) // Sort by date descending (newest first)
      .exec();

    return userShifts.map(this.transformShift);
  }

  private transformShift(shift: any): ScheduleShiftDto {
    return {
      id: shift._id.toString(),
      scheduleId: shift.scheduleId.toString(),
      shiftType: {
        id: shift.shiftTypeId._id.toString(),
        name: shift.shiftTypeId.name,
        startTime: shift.shiftTypeId.startTime,
        endTime: shift.shiftTypeId.endTime,
        colorIndex: shift.shiftTypeId.colorIndex,
        isActive: shift.shiftTypeId.isActive,
        createdAt: shift.shiftTypeId.createdAt,
        updatedAt: shift.shiftTypeId.updatedAt,
      },
      date: shift.date,
      user: shift.userId ? {
        id: shift.userId._id.toString(),
        firstName: shift.userId.firstName,
        lastName: shift.userId.lastName,
        role: shift.userId.role,
      } : null,
      order: shift.order,
      isActive: shift.isActive,
      actualStartTime: shift.actualStartTime,
      actualEndTime: shift.actualEndTime,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    };
  }
}