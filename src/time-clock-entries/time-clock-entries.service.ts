import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  TimeClockEntrySchemaClass, 
  TimeClockEntrySchemaDocument, 
  TimeClockStatus 
} from './schemas/time-clock-entry.schema';
import { CreateTimeClockEntryDto } from './dto/create-time-clock-entry.dto';
import { UpdateTimeClockEntryDto } from './dto/update-time-clock-entry.dto';
import { TimeClockQueryDto } from './dto/time-clock-query.dto';
import { 
  TimeClockStatusDto, 
  TimeClockSummaryDto, 
  EmployeeTimeClockSummaryDto,
  ActiveEmployeeDto 
} from './dto/time-clock-summary.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TimeClockEntriesService {
  constructor(
    @InjectModel(TimeClockEntrySchemaClass.name)
    private readonly timeClockEntryModel: Model<TimeClockEntrySchemaDocument>,
  ) {}

  /**
   * Clock in an employee
   */
  async clockIn(employeeId: string, createDto: CreateTimeClockEntryDto): Promise<TimeClockEntrySchemaDocument> {
    const employeeObjectId = new Types.ObjectId(employeeId);

    // Check if employee is already clocked in
    const existingEntry = await this.timeClockEntryModel.findOne({
      employee: employeeObjectId,
      status: TimeClockStatus.CLOCKED_IN,
    });

    if (existingEntry) {
      throw new ConflictException('Employee is already clocked in');
    }

    // Create new clock-in entry
    const entry = new this.timeClockEntryModel({
      employee: employeeObjectId,
      clockInTime: new Date(),
      status: TimeClockStatus.CLOCKED_IN,
      notes: createDto.notes || null,
    });

    await entry.save();

    return entry.populate('employee', '_id email firstName lastName avatar');
  }

  /**
   * Clock out an employee
   */
  async clockOut(employeeId: string, updateDto: UpdateTimeClockEntryDto): Promise<TimeClockEntrySchemaDocument> {
    const employeeObjectId = new Types.ObjectId(employeeId);

    // Find the active clock-in entry
    const entry = await this.timeClockEntryModel.findOne({
      employee: employeeObjectId,
      status: TimeClockStatus.CLOCKED_IN,
    });

    if (!entry) {
      throw new BadRequestException('Employee is not currently clocked in');
    }

    // Calculate total minutes worked
    const clockOutTime = new Date();
    const totalMinutes = Math.floor((clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60));

    // Update the entry
    entry.clockOutTime = clockOutTime;
    entry.totalMinutes = totalMinutes;
    entry.status = TimeClockStatus.CLOCKED_OUT;
    
    if (updateDto.notes) {
      entry.notes = updateDto.notes;
    }

    await entry.save();

    return entry.populate('employee', '_id email firstName lastName avatar');
  }

  /**
   * Get current status for an employee
   */
  async getCurrentStatus(employeeId: string): Promise<TimeClockStatusDto> {
    const employeeObjectId = new Types.ObjectId(employeeId);

    const currentEntry = await this.timeClockEntryModel
      .findOne({
        employee: employeeObjectId,
        status: TimeClockStatus.CLOCKED_IN,
      })
      .populate('employee', '_id email firstName lastName avatar')
      .lean();

    const isClockedIn = !!currentEntry;
    
    const statusDto = new TimeClockStatusDto();
    statusDto.status = isClockedIn ? TimeClockStatus.CLOCKED_IN : TimeClockStatus.CLOCKED_OUT;
    statusDto.isClockedIn = isClockedIn;

    if (currentEntry) {
      statusDto.currentEntry = currentEntry as any;
      statusDto.currentSessionMinutes = Math.floor((new Date().getTime() - currentEntry.clockInTime.getTime()) / (1000 * 60));
      statusDto.currentSessionDisplay = this.formatDuration(statusDto.currentSessionMinutes);
      statusDto.clockedInAt = currentEntry.clockInTime;
    }

    return statusDto;
  }

  /**
   * Get time entries for an employee
   */
  async getEmployeeTimeEntries(
    employeeId: string, 
    queryDto: TimeClockQueryDto
  ): Promise<{ entries: TimeClockEntrySchemaDocument[]; total: number; page: number; limit: number }> {
    const employeeObjectId = new Types.ObjectId(employeeId);
    const { startDate, endDate, page = 1, limit = 50 } = queryDto;

    const filter: any = { employee: employeeObjectId };

    // Add date filters if provided
    if (startDate || endDate) {
      filter.clockInTime = {};
      if (startDate) {
        filter.clockInTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.clockInTime.$lte = endOfDay;
      }
    }

    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.timeClockEntryModel
        .find(filter)
        .populate('employee', '_id email firstName lastName avatar')
        .sort({ clockInTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.timeClockEntryModel.countDocuments(filter),
    ]);

    return {
      entries: entries as TimeClockEntrySchemaDocument[],
      total,
      page,
      limit,
    };
  }

  /**
   * Get all time entries (admin only)
   */
  async getAllTimeEntries(
    queryDto: TimeClockQueryDto
  ): Promise<{ entries: TimeClockEntrySchemaDocument[]; total: number; page: number; limit: number }> {
    const { startDate, endDate, employeeId, page = 1, limit = 50 } = queryDto;

    const filter: any = {};

    // Add employee filter if provided
    if (employeeId) {
      filter.employee = new Types.ObjectId(employeeId);
    }

    // Add date filters if provided
    if (startDate || endDate) {
      filter.clockInTime = {};
      if (startDate) {
        filter.clockInTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.clockInTime.$lte = endOfDay;
      }
    }

    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.timeClockEntryModel
        .find(filter)
        .populate('employee', '_id email firstName lastName avatar')
        .sort({ clockInTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.timeClockEntryModel.countDocuments(filter),
    ]);

    return {
      entries: entries as TimeClockEntrySchemaDocument[],
      total,
      page,
      limit,
    };
  }

  /**
   * Get currently clocked in employees (admin only)
   */
  async getCurrentlyClockedInEmployees(): Promise<any[]> {
    const activeEntries = await this.timeClockEntryModel
      .find({ status: TimeClockStatus.CLOCKED_IN })
      .populate('employee', '_id email firstName lastName avatar')
      .sort({ clockInTime: -1 })
      .lean();

    return activeEntries.map(entry => {
      const currentSessionMinutes = Math.floor((new Date().getTime() - entry.clockInTime.getTime()) / (1000 * 60));
      
      return {
        employee: entry.employee,
        clockedInAt: entry.clockInTime,
        currentSessionMinutes,
        currentSessionDisplay: this.formatDuration(currentSessionMinutes),
        notes: entry.notes || undefined,
      };
    });
  }

  /**
   * Get summary statistics (admin only)
   */
  async getSummaryStatistics(queryDto: TimeClockQueryDto): Promise<TimeClockSummaryDto> {
    const { startDate, endDate } = queryDto;

    const filter: any = {};

    // Add date filters if provided
    if (startDate || endDate) {
      filter.clockInTime = {};
      if (startDate) {
        filter.clockInTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.clockInTime.$lte = endOfDay;
      }
    }

    const [
      activeEmployees,
      totalEntries,
      completedEntries,
      ongoingEntries,
      totalMinutesResult,
    ] = await Promise.all([
      this.getCurrentlyClockedInEmployees(),
      this.timeClockEntryModel.countDocuments(filter),
      this.timeClockEntryModel.countDocuments({ ...filter, status: TimeClockStatus.CLOCKED_OUT }),
      this.timeClockEntryModel.countDocuments({ ...filter, status: TimeClockStatus.CLOCKED_IN }),
      this.timeClockEntryModel.aggregate([
        { $match: { ...filter, status: TimeClockStatus.CLOCKED_OUT } },
        { $group: { _id: null, total: { $sum: '$totalMinutes' } } },
      ]),
    ]);

    const totalMinutesWorked = totalMinutesResult[0]?.total || 0;

    return {
      totalActiveClockedIn: activeEmployees.length,
      activeEmployees,
      totalMinutesWorked,
      totalHoursWorked: Math.round((totalMinutesWorked / 60) * 100) / 100,
      totalEntries,
      completedEntries,
      ongoingEntries,
    };
  }

  /**
   * Get employee summary statistics (admin only)
   */
  async getEmployeeSummaryStatistics(
    employeeId: string, 
    queryDto: TimeClockQueryDto
  ): Promise<EmployeeTimeClockSummaryDto> {
    const employeeObjectId = new Types.ObjectId(employeeId);
    const { startDate, endDate } = queryDto;

    const filter: any = { employee: employeeObjectId };

    // Add date filters if provided
    if (startDate || endDate) {
      filter.clockInTime = {};
      if (startDate) {
        filter.clockInTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.clockInTime.$lte = endOfDay;
      }
    }

    const [
      employee,
      totalEntries,
      completedEntries,
      ongoingEntries,
      totalMinutesResult,
      currentEntry,
    ] = await Promise.all([
      this.timeClockEntryModel
        .findOne({ employee: employeeObjectId })
        .populate('employee', '_id email firstName lastName avatar')
        .select('employee')
        .lean(),
      this.timeClockEntryModel.countDocuments(filter),
      this.timeClockEntryModel.countDocuments({ ...filter, status: TimeClockStatus.CLOCKED_OUT }),
      this.timeClockEntryModel.countDocuments({ ...filter, status: TimeClockStatus.CLOCKED_IN }),
      this.timeClockEntryModel.aggregate([
        { $match: { ...filter, status: TimeClockStatus.CLOCKED_OUT } },
        { $group: { _id: null, total: { $sum: '$totalMinutes' } } },
      ]),
      this.timeClockEntryModel
        .findOne({ employee: employeeObjectId, status: TimeClockStatus.CLOCKED_IN })
        .lean(),
    ]);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const totalMinutesWorked = totalMinutesResult[0]?.total || 0;
    const currentlyClockedIn = !!currentEntry;

    return {
      employee: employee.employee as any,
      totalMinutesWorked,
      totalHoursWorked: Math.round((totalMinutesWorked / 60) * 100) / 100,
      totalEntries,
      completedEntries,
      ongoingEntries,
      currentlyClockedIn,
      currentClockInTime: currentEntry?.clockInTime || undefined,
      currentSessionMinutes: currentEntry ? 
        Math.floor((new Date().getTime() - currentEntry.clockInTime.getTime()) / (1000 * 60)) : 
        undefined,
    };
  }

  /**
   * Get a specific time entry by ID
   */
  async getTimeEntry(entryId: string, employeeId?: string): Promise<TimeClockEntrySchemaDocument> {
    const entryObjectId = new Types.ObjectId(entryId);
    const filter: any = { _id: entryObjectId };

    // If employeeId is provided, ensure the entry belongs to that employee
    if (employeeId) {
      filter.employee = new Types.ObjectId(employeeId);
    }

    const entry = await this.timeClockEntryModel
      .findOne(filter)
      .populate('employee', '_id email firstName lastName avatar')
      .lean();

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    return entry as TimeClockEntrySchemaDocument;
  }

  /**
   * Helper method to format duration
   */
  private formatDuration(minutes: number): string {
    if (minutes === 0) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}