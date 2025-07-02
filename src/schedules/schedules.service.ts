import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ScheduleSchemaClass,
  ScheduleSchemaDocument,
  ScheduleStatus,
} from './schemas/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';

@Injectable()
export class SchedulesService {
  private scheduleShiftsService: any; // Will be injected after initialization to avoid circular dependency

  constructor(
    @InjectModel(ScheduleSchemaClass.name)
    private readonly scheduleModel: Model<ScheduleSchemaDocument>,
  ) {}

  // Setter for circular dependency injection
  setScheduleShiftsService(scheduleShiftsService: any) {
    this.scheduleShiftsService = scheduleShiftsService;
  }

  async create(
    createScheduleDto: CreateScheduleDto,
    createdBy: string,
  ): Promise<any> {
    const startDate = new Date(createScheduleDto.startDate);
    const endDate = new Date(createScheduleDto.endDate);

    // Check for overlapping schedules
    const existingSchedule = await this.scheduleModel
      .findOne({
        $or: [
          // New schedule starts within existing schedule
          {
            startDate: { $lte: startDate },
            endDate: { $gte: startDate },
          },
          // New schedule ends within existing schedule
          {
            startDate: { $lte: endDate },
            endDate: { $gte: endDate },
          },
          // New schedule completely contains existing schedule
          {
            startDate: { $gte: startDate },
            endDate: { $lte: endDate },
          },
        ],
      })
      .exec();

    if (existingSchedule) {
      throw new ConflictException(
        'A schedule already exists for this date range',
      );
    }

    const schedule = new this.scheduleModel({
      ...createScheduleDto,
      startDate,
      endDate,
      status: ScheduleStatus.DRAFT,
      createdBy,
    });

    const saved = await schedule.save();
    return {
      id: saved._id.toString(),
      name: saved.name,
      startDate: saved.startDate,
      endDate: saved.endDate,
      status: saved.status,
      createdBy: saved.createdBy,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async findAll(queryDto: QueryScheduleDto): Promise<any[]> {
    const { status, page = 1, limit = 10 } = queryDto;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const schedules = await this.scheduleModel
      .find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ startDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    return schedules.map((schedule) => ({
      id: schedule._id.toString(),
      name: schedule.name,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      status: schedule.status,
      createdBy: schedule.createdBy,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    }));
  }

  async findOne(id: string): Promise<any> {
    const schedule = await this.scheduleModel
      .findById(id)
      .populate('createdBy', 'firstName lastName')
      .lean()
      .exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return {
      id: schedule._id.toString(),
      name: schedule.name,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      status: schedule.status,
      createdBy: schedule.createdBy,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<any> {
    const updateData: any = { ...updateScheduleDto, updatedAt: new Date() };

    if (updateScheduleDto.startDate) {
      updateData.startDate = new Date(updateScheduleDto.startDate);
    }
    if (updateScheduleDto.endDate) {
      updateData.endDate = new Date(updateScheduleDto.endDate);
    }

    const schedule = await this.scheduleModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('createdBy', 'firstName lastName')
      .lean()
      .exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return {
      id: schedule._id.toString(),
      name: schedule.name,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      status: schedule.status,
      createdBy: schedule.createdBy,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.scheduleModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Schedule not found');
    }
  }

  async publish(id: string): Promise<any> {
    const schedule = await this.scheduleModel
      .findByIdAndUpdate(
        id,
        { status: ScheduleStatus.PUBLISHED, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
      .populate('createdBy', 'firstName lastName')
      .lean()
      .exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Activate all schedule shifts and set actual times from shift types
    if (this.scheduleShiftsService) {
      await this.scheduleShiftsService.activateScheduleShifts(id);
    }

    return {
      id: schedule._id.toString(),
      name: schedule.name,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      status: schedule.status,
      createdBy: schedule.createdBy,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }

  async findMostRecentPublished(
    beforeDate: Date,
  ): Promise<ScheduleSchemaDocument | null> {
    return this.scheduleModel
      .findOne({
        status: ScheduleStatus.PUBLISHED,
        endDate: { $lt: beforeDate },
      })
      .sort({ endDate: -1 })
      .exec();
  }

  /**
   * Retrieves all published scheduled shifts for a given user.
   * Assumes ScheduleShiftsService is injected and has a findManyByQuery method
   * that can perform queries and population on ScheduleShift documents.
   * Assumes ScheduleShift documents have 'user', 'scheduleId', and 'isActive' fields.
   */
  async findPublishedShiftsByUserId(userId: string): Promise<any[]> {
    if (!this.scheduleShiftsService) {
      throw new Error(
        'ScheduleShiftsService is not initialized. Check circular dependency injection.',
      );
    }

    // Assuming ScheduleShift has fields: user (ObjectId), scheduleId (ObjectId), isActive (boolean)
    // Using findAll as a common method name for retrieving multiple documents
    const shifts = await this.scheduleShiftsService.findAll(
      {
        user: userId,
        isActive: true,
      },
      // Populate scheduleId to filter by schedule status
      [
        // Assuming an array for populate options
        {
          path: 'scheduleId',
          match: { status: ScheduleStatus.PUBLISHED }, // This will filter out shifts whose schedule is not published
          select: 'name startDate endDate status', // Select relevant fields from schedule
        },
        // Populate shiftType and user details if needed for the shift DTO
        { path: 'shiftType' }, // Populate shiftType details
        { path: 'user', select: 'firstName lastName role' }, // Populate user details
      ],
    );

    // Filter out shifts whose associated schedule was not found or not published
    // The 'match' in populate might already handle this, but an explicit filter adds robustness.
    const filteredShifts = shifts.filter(
      (shift) =>
        shift.scheduleId &&
        shift.scheduleId.status === ScheduleStatus.PUBLISHED,
    );

    return filteredShifts.map((shift) => ({
      id: shift._id.toString(),
      scheduleId: shift.scheduleId._id.toString(),
      shiftType: shift.shiftType,
      date: shift.date,
      user: shift.user,
      order: shift.order,
      isActive: shift.isActive,
      actualStartTime: shift.actualStartTime,
      actualEndTime: shift.actualEndTime,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    }));
  }
}
