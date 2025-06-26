import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScheduleSchemaClass, ScheduleSchemaDocument, ScheduleStatus } from './schemas/schedule.schema';
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
    const existingSchedule = await this.scheduleModel.findOne({
      $or: [
        // New schedule starts within existing schedule
        {
          startDate: { $lte: startDate },
          endDate: { $gte: startDate }
        },
        // New schedule ends within existing schedule  
        {
          startDate: { $lte: endDate },
          endDate: { $gte: endDate }
        },
        // New schedule completely contains existing schedule
        {
          startDate: { $gte: startDate },
          endDate: { $lte: endDate }
        }
      ]
    }).exec();

    if (existingSchedule) {
      throw new ConflictException('A schedule already exists for this date range');
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

    return schedules.map(schedule => ({
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

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<any> {
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

  async findMostRecentPublished(beforeDate: Date): Promise<ScheduleSchemaDocument | null> {
    return this.scheduleModel
      .findOne({ 
        status: ScheduleStatus.PUBLISHED,
        endDate: { $lt: beforeDate }
      })
      .sort({ endDate: -1 })
      .exec();
  }
}