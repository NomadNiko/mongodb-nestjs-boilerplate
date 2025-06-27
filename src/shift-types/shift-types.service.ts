import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShiftTypeSchemaClass, ShiftTypeSchemaDocument } from './schemas/shift-type.schema';
import { ScheduleShiftSchemaClass, ScheduleShiftSchemaDocument } from '../schedule-shifts/schemas/schedule-shift.schema';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';

@Injectable()
export class ShiftTypesService {
  constructor(
    @InjectModel(ShiftTypeSchemaClass.name)
    private readonly shiftTypeModel: Model<ShiftTypeSchemaDocument>,
    @InjectModel(ScheduleShiftSchemaClass.name)
    private readonly scheduleShiftModel: Model<ScheduleShiftSchemaDocument>,
  ) {}

  async create(createShiftTypeDto: CreateShiftTypeDto): Promise<any> {
    const shiftType = new this.shiftTypeModel({
      ...createShiftTypeDto,
      colorIndex: createShiftTypeDto.colorIndex || 0,
      isActive: true,
    });

    const saved = await shiftType.save();
    return {
      id: saved._id.toString(),
      name: saved.name,
      startTime: saved.startTime,
      endTime: saved.endTime,
      colorIndex: saved.colorIndex,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async findAll(): Promise<any[]> {
    const shiftTypes = await this.shiftTypeModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .lean()
      .exec();
    
    return shiftTypes.map(shiftType => ({
      id: shiftType._id.toString(),
      name: shiftType.name,
      startTime: shiftType.startTime,
      endTime: shiftType.endTime,
      colorIndex: shiftType.colorIndex,
      isActive: shiftType.isActive,
      createdAt: shiftType.createdAt,
      updatedAt: shiftType.updatedAt,
    }));
  }

  async findOne(id: string): Promise<any> {
    const shiftType = await this.shiftTypeModel
      .findOne({ _id: id, isActive: true })
      .lean()
      .exec();

    if (!shiftType) {
      throw new NotFoundException('Shift type not found');
    }

    return {
      id: shiftType._id.toString(),
      name: shiftType.name,
      startTime: shiftType.startTime,
      endTime: shiftType.endTime,
      colorIndex: shiftType.colorIndex,
      isActive: shiftType.isActive,
      createdAt: shiftType.createdAt,
      updatedAt: shiftType.updatedAt,
    };
  }

  async update(
    id: string,
    updateShiftTypeDto: UpdateShiftTypeDto,
  ): Promise<any> {
    const shiftType = await this.shiftTypeModel
      .findOneAndUpdate(
        { _id: id, isActive: true },
        { ...updateShiftTypeDto, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();

    if (!shiftType) {
      throw new NotFoundException('Shift type not found');
    }

    return {
      id: shiftType._id.toString(),
      name: shiftType.name,
      startTime: shiftType.startTime,
      endTime: shiftType.endTime,
      colorIndex: shiftType.colorIndex,
      isActive: shiftType.isActive,
      createdAt: shiftType.createdAt,
      updatedAt: shiftType.updatedAt,
    };
  }

  async remove(id: string): Promise<void> {
    // Check if shift type is used in any published schedules
    const usedInSchedules = await this.scheduleShiftModel.countDocuments({
      shiftTypeId: id,
      isActive: true
    });
    
    if (usedInSchedules > 0) {
      throw new ConflictException('Cannot delete shift type that is used in published schedules');
    }

    const result = await this.shiftTypeModel
      .findOneAndUpdate(
        { _id: id, isActive: true },
        { isActive: false, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!result) {
      throw new NotFoundException('Shift type not found');
    }
  }

  async findByIds(ids: string[]): Promise<ShiftTypeSchemaDocument[]> {
    const validIds = ids.filter(id => Types.ObjectId.isValid(id));
    const objectIds = validIds.map(id => new Types.ObjectId(id));
    return this.shiftTypeModel
      .find({ _id: { $in: objectIds }, isActive: true })
      .exec();
  }
}