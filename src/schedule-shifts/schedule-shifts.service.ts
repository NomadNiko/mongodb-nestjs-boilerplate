import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { ScheduleShiftSchemaClass, ScheduleShiftSchemaDocument } from './schemas/schedule-shift.schema';
import { ScheduleSchemaClass, ScheduleSchemaDocument } from '../schedules/schemas/schedule.schema';
import { ShiftTypeSchemaClass, ShiftTypeSchemaDocument } from '../shift-types/schemas/shift-type.schema';
import { CreateScheduleShiftDto } from './dto/create-schedule-shift.dto';
import { UpdateScheduleShiftDto } from './dto/update-schedule-shift.dto';
import { UpdateShiftTimesDto } from './dto/update-shift-times.dto';
import { ScheduleShiftsResponseDto } from './dto/schedule-shift.dto';
import { CopyPreviousResponseDto } from './dto/copy-previous-response.dto';
import { BulkOperationsDto, BulkOperationsResponseDto, BulkOperationType, BulkOperationResultDto } from './dto/bulk-operations.dto';
import { timeRangesOverlap } from './utils/time-utils';

@Injectable()
export class ScheduleShiftsService {
  constructor(
    @InjectModel(ScheduleShiftSchemaClass.name)
    private readonly scheduleShiftModel: Model<ScheduleShiftSchemaDocument>,
    @InjectModel(ScheduleSchemaClass.name)
    private readonly scheduleModel: Model<ScheduleSchemaDocument>,
    @InjectModel(ShiftTypeSchemaClass.name)
    private readonly shiftTypeModel: Model<ShiftTypeSchemaDocument>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async create(
    scheduleId: string,
    createScheduleShiftDto: CreateScheduleShiftDto,
  ): Promise<any> {
    // Verify schedule exists
    const schedule = await this.scheduleModel.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Verify shift type exists
    const shiftType = await this.shiftTypeModel.findById(createScheduleShiftDto.shiftTypeId);
    if (!shiftType) {
      throw new NotFoundException('Shift type not found');
    }

    // Calculate order if not provided
    let order = createScheduleShiftDto.order || 1;
    if (!createScheduleShiftDto.order) {
      const existingShiftsCount = await this.scheduleShiftModel.countDocuments({
        scheduleId,
        date: new Date(createScheduleShiftDto.date),
      });
      order = existingShiftsCount + 1;
    }

    const scheduleShift = new this.scheduleShiftModel({
      scheduleId,
      shiftTypeId: createScheduleShiftDto.shiftTypeId,
      date: new Date(createScheduleShiftDto.date),
      order,
      isActive: false, // Will be set to true when schedule is published
    });

    const saved = await scheduleShift.save();
    const populated = await this.scheduleShiftModel
      .findById(saved._id)
      .populate('shiftTypeId')
      .exec();
    
    return this.transformShift(populated);
  }

  async findBySchedule(scheduleId: string): Promise<ScheduleShiftsResponseDto> {
    const shifts = await this.scheduleShiftModel
      .find({ scheduleId })
      .populate('shiftTypeId')
      .populate('userId', 'firstName lastName role avatar')
      .sort({ date: 1, order: 1 })
      .exec();

    const assignedShifts = shifts.filter(s => s.userId);
    const unassignedShifts = shifts.filter(s => !s.userId);

    return {
      shifts: assignedShifts.map(this.transformShift),
      unassignedShifts: unassignedShifts.map(this.transformShift),
    };
  }

  async update(
    scheduleId: string,
    shiftId: string,
    updateScheduleShiftDto: UpdateScheduleShiftDto,
  ): Promise<any> {
    const shift = await this.scheduleShiftModel
      .findOne({ _id: shiftId, scheduleId })
      .populate('shiftTypeId')
      .exec();

    if (!shift) {
      throw new NotFoundException('Schedule shift not found');
    }

    const updateData: any = { updatedAt: new Date() };

    // Handle user assignment
    if (updateScheduleShiftDto.userId !== undefined) {
      if (updateScheduleShiftDto.userId) {
        // Check for time conflicts when assigning user
        const conflicts = await this.checkTimeConflicts(
          updateScheduleShiftDto.userId,
          shift.date,
          shift.shiftTypeId as any,
        );
        
        if (conflicts.length > 0) {
          throw new ConflictException({
            message: 'User has conflicting shifts',
            conflicts: conflicts.map(c => ({
              id: c._id,
              shiftType: c.shiftTypeId,
              date: c.date,
            })),
          });
        }
        updateData.userId = updateScheduleShiftDto.userId;
      } else {
        updateData.userId = null; // Unassign user
      }
    }

    // Handle order change
    if (updateScheduleShiftDto.order !== undefined) {
      updateData.order = updateScheduleShiftDto.order;
    }

    const updatedShift = await this.scheduleShiftModel
      .findByIdAndUpdate(shiftId, updateData, { new: true })
      .populate('shiftTypeId')
      .populate('userId', 'firstName lastName role avatar')
      .exec();

    if (!updatedShift) {
      throw new NotFoundException('Schedule shift not found');
    }

    return this.transformShift(updatedShift);
  }

  async updateTimes(
    scheduleId: string,
    shiftId: string,
    updateShiftTimesDto: UpdateShiftTimesDto,
  ): Promise<any> {
    const shift = await this.scheduleShiftModel
      .findOne({ _id: shiftId, scheduleId })
      .exec();

    if (!shift) {
      throw new NotFoundException('Schedule shift not found');
    }

    if (!shift.isActive) {
      throw new BadRequestException('Can only adjust times on published schedule shifts');
    }

    const updateData: any = { updatedAt: new Date() };

    if (updateShiftTimesDto.actualStartTime) {
      updateData.actualStartTime = updateShiftTimesDto.actualStartTime;
    }

    if (updateShiftTimesDto.actualEndTime) {
      updateData.actualEndTime = updateShiftTimesDto.actualEndTime;
    }

    const updatedShift = await this.scheduleShiftModel
      .findByIdAndUpdate(shiftId, updateData, { new: true })
      .populate('shiftTypeId')
      .populate('userId', 'firstName lastName role avatar')
      .exec();

    if (!updatedShift) {
      throw new NotFoundException('Schedule shift not found');
    }

    return this.transformShift(updatedShift);
  }

  async remove(scheduleId: string, shiftId: string): Promise<void> {
    const result = await this.scheduleShiftModel
      .findOneAndDelete({ _id: shiftId, scheduleId })
      .exec();

    if (!result) {
      throw new NotFoundException('Schedule shift not found');
    }
  }

  async copyPrevious(scheduleId: string): Promise<CopyPreviousResponseDto> {
    console.log('🔄 Starting Copy Previous Week for schedule:', scheduleId);
    
    const currentSchedule = await this.scheduleModel.findById(scheduleId);
    if (!currentSchedule) {
      throw new NotFoundException('Schedule not found');
    }

    console.log('📅 Current schedule:', {
      name: currentSchedule.name,
      startDate: currentSchedule.startDate,
      endDate: currentSchedule.endDate,
      status: currentSchedule.status
    });

    // Find the most recent published schedule (newest by endDate)
    const mostRecentPublishedSchedule = await this.scheduleModel
      .findOne({ 
        status: 'published',
        _id: { $ne: scheduleId } // Exclude current schedule
      })
      .sort({ endDate: -1 }) // Sort by endDate descending (most recent first)
      .exec();

    if (!mostRecentPublishedSchedule) {
      console.log('❌ No published schedule found to copy from');
      throw new NotFoundException('No published schedule found to copy from');
    }

    console.log('📋 Most recent published schedule to copy from:', {
      name: mostRecentPublishedSchedule.name,
      startDate: mostRecentPublishedSchedule.startDate,
      endDate: mostRecentPublishedSchedule.endDate
    });

    // Get shifts from the most recent published schedule
    // Use string-based query since scheduleId is stored as string in database
    const sourceShifts = await this.scheduleShiftModel
      .find({ scheduleId: mostRecentPublishedSchedule._id.toString() })
      .populate('shiftTypeId')
      .exec();

    console.log('📊 Found shifts in source schedule:', sourceShifts.length);

    if (sourceShifts.length === 0) {
      return {
        message: 'No shifts found in the most recent published schedule',
        count: 0,
        shiftsToCreate: [],
        sourceScheduleName: mostRecentPublishedSchedule.name,
      };
    }

    // Group shifts by day of week and shift type
    const shiftPatternsByDay: { [dayOfWeek: number]: { [shiftTypeId: string]: number } } = {};
    
    sourceShifts.forEach(shift => {
      const dayOfWeek = shift.date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      // Extract the actual shiftTypeId from the populated object or use the raw ID
      const shiftTypeId = shift.shiftTypeId._id ? shift.shiftTypeId._id.toString() : shift.shiftTypeId.toString();
      
      if (!shiftPatternsByDay[dayOfWeek]) {
        shiftPatternsByDay[dayOfWeek] = {};
      }
      
      if (!shiftPatternsByDay[dayOfWeek][shiftTypeId]) {
        shiftPatternsByDay[dayOfWeek][shiftTypeId] = 0;
      }
      
      shiftPatternsByDay[dayOfWeek][shiftTypeId]++;
    });

    console.log('📈 Analyzed shift patterns by day:', shiftPatternsByDay);

    // Generate dates for current schedule week (Monday to Sunday)
    const currentStartDate = new Date(currentSchedule.startDate);
    const weekDates: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentStartDate);
      date.setDate(currentStartDate.getDate() + i);
      weekDates.push(date);
    }

    console.log('📅 Target week dates:', weekDates.map(d => d.toISOString().split('T')[0]));

    // Create shift pattern data to return (NOT save to database)
    const shiftsToCreate: Array<{shiftTypeId: string, date: string, order: number}> = [];
    
    weekDates.forEach(date => {
      const dayOfWeek = date.getDay();
      const patterns = shiftPatternsByDay[dayOfWeek];
      
      if (patterns) {
        Object.entries(patterns).forEach(([shiftTypeId, count]) => {
          // Create 'count' number of shift patterns for this shift type on this day
          for (let i = 0; i < count; i++) {
            shiftsToCreate.push({
              shiftTypeId: shiftTypeId,
              date: date.toISOString().split('T')[0], // YYYY-MM-DD format
              order: i + 1, // Order starts from 1
            });
          }
        });
      }
    });

    console.log('✨ Generated shift patterns to create:', shiftsToCreate.length);
    console.log('📝 Shift patterns breakdown:', shiftsToCreate);

    return {
      message: `Found ${shiftsToCreate.length} shifts to copy from "${mostRecentPublishedSchedule.name}" based on shift patterns`,
      count: shiftsToCreate.length,
      shiftsToCreate: shiftsToCreate,
      sourceScheduleName: mostRecentPublishedSchedule.name,
    };
  }

  async bulkOperations(
    scheduleId: string,
    bulkOperationsDto: BulkOperationsDto,
  ): Promise<BulkOperationsResponseDto> {
    // DEBUG: Log incoming data
    console.log('🔍 BULK OPERATIONS DEBUG:', {
      scheduleId,
      operationsCount: bulkOperationsDto.operations?.length || 0,
      operations: bulkOperationsDto.operations?.map(op => ({
        type: op.type,
        typeOf: typeof op.type,
        clientId: (op as any).clientId,
        hasId: !!(op as any).id,
        hasData: !!(op as any).data
      }))
    });

    // Verify schedule exists
    const schedule = await this.scheduleModel.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const session = await this.connection.startSession();
    const results: BulkOperationResultDto[] = [];
    let successfulOperations = 0;
    let failedOperations = 0;

    try {
      await session.withTransaction(async () => {
        // Process all operations in sequence to maintain data consistency
        for (const operation of bulkOperationsDto.operations) {
          try {
            let result: BulkOperationResultDto;

            // DEBUG: Log each operation before processing
            console.log('🔍 Processing operation:', {
              type: operation.type,
              typeOf: typeof operation.type,
              enumCreate: BulkOperationType.CREATE,
              enumUpdate: BulkOperationType.UPDATE,
              enumDelete: BulkOperationType.DELETE,
              matches: {
                create: operation.type === BulkOperationType.CREATE,
                update: operation.type === BulkOperationType.UPDATE,
                delete: operation.type === BulkOperationType.DELETE
              }
            });

            switch (operation.type) {
              case BulkOperationType.CREATE:
                result = await this.processBulkCreate(scheduleId, operation, session);
                break;
              
              case BulkOperationType.UPDATE:
                result = await this.processBulkUpdate(scheduleId, operation, session);
                break;
              
              case BulkOperationType.DELETE:
                result = await this.processBulkDelete(scheduleId, operation, session);
                break;
              
              default:
                throw new Error(`Unsupported operation type: ${(operation as any).type}`);
            }

            results.push(result);
            if (result.success) {
              successfulOperations++;
            } else {
              failedOperations++;
            }
          } catch (error) {
            const result: BulkOperationResultDto = {
              type: operation.type,
              success: false,
              clientId: (operation as any).clientId,
              error: error.message,
            };
            results.push(result);
            failedOperations++;
          }
        }

        // If any operation failed, throw to abort transaction
        if (failedOperations > 0) {
          throw new Error(`${failedOperations} operations failed`);
        }
      });
    } catch (error) {
      // Transaction was aborted, mark all results as failed
      for (const result of results) {
        if (result.success) {
          result.success = false;
          result.error = 'Transaction aborted due to other operation failures';
        }
      }
      successfulOperations = 0;
      failedOperations = results.length;
    } finally {
      await session.endSession();
    }

    return {
      results,
      totalOperations: bulkOperationsDto.operations.length,
      successfulOperations,
      failedOperations,
      allSuccessful: failedOperations === 0,
    };
  }

  private async processBulkCreate(
    scheduleId: string,
    operation: any,
    session: any,
  ): Promise<BulkOperationResultDto> {
    // Verify shift type exists
    const shiftType = await this.shiftTypeModel.findById(operation.data.shiftTypeId).session(session);
    if (!shiftType) {
      throw new Error('Shift type not found');
    }

    // Check for time conflicts if user is being assigned
    if (operation.data.userId) {
      const conflicts = await this.checkTimeConflictsInSession(
        operation.data.userId,
        new Date(operation.data.date),
        shiftType,
        session,
      );
      
      if (conflicts.length > 0) {
        throw new Error('User has conflicting shifts');
      }
    }

    // Calculate order if not provided
    let order = operation.data.order || 1;
    if (!operation.data.order) {
      const existingShiftsCount = await this.scheduleShiftModel
        .countDocuments({
          scheduleId,
          date: new Date(operation.data.date),
        })
        .session(session);
      order = existingShiftsCount + 1;
    }

    // Create shift with user assignment if provided
    const scheduleShift = new this.scheduleShiftModel({
      scheduleId,
      shiftTypeId: operation.data.shiftTypeId,
      date: new Date(operation.data.date),
      order,
      userId: operation.data.userId || null,
      isActive: false,
    });

    const saved = await scheduleShift.save({ session });
    const populated = await this.scheduleShiftModel
      .findById(saved._id)
      .populate('shiftTypeId')
      .populate('userId', 'firstName lastName role avatar')
      .session(session)
      .exec();

    return {
      type: BulkOperationType.CREATE,
      success: true,
      clientId: operation.clientId,
      id: saved._id.toString(),
      data: this.transformShift(populated),
    };
  }

  private async processBulkUpdate(
    scheduleId: string,
    operation: any,
    session: any,
  ): Promise<BulkOperationResultDto> {
    try {
      console.log('🔍 UPDATE OPERATION DETAILS:', {
        operationId: operation.id,
        operationData: operation.data,
        scheduleId
      });

      const shift = await this.scheduleShiftModel
        .findOne({ _id: operation.id, scheduleId })
        .populate('shiftTypeId')
        .session(session)
        .exec();

      if (!shift) {
        console.log('❌ Shift not found:', operation.id);
        throw new Error('Schedule shift not found');
      }

      console.log('✅ Found shift to update:', {
        id: shift._id,
        currentDate: shift.date,
        currentUserId: shift.userId,
        currentOrder: shift.order
      });

      const updateData: any = { updatedAt: new Date() };

      // Handle date change
      if (operation.data.date !== undefined) {
        console.log('📅 Updating date from', shift.date, 'to', operation.data.date);
        updateData.date = new Date(operation.data.date);
      }

      // Handle user assignment
      if (operation.data.userId !== undefined) {
        console.log('👤 Updating userId from', shift.userId, 'to', operation.data.userId);
        if (operation.data.userId) {
          // Check for time conflicts when assigning user
          const targetDate = operation.data.date ? new Date(operation.data.date) : shift.date;
          const conflicts = await this.checkTimeConflictsInSession(
            operation.data.userId,
            targetDate,
            shift.shiftTypeId as any,
            session,
          );
          
          if (conflicts.length > 0) {
            console.log('⚠️ Time conflicts detected:', conflicts.length);
            throw new Error('User has conflicting shifts');
          }
          updateData.userId = operation.data.userId;
        } else {
          updateData.userId = null; // Unassign user
        }
      }

      // Handle order change
      if (operation.data.order !== undefined) {
        console.log('🔢 Updating order from', shift.order, 'to', operation.data.order);
        updateData.order = operation.data.order;
      }

      console.log('💾 Applying update data:', updateData);

      const updatedShift = await this.scheduleShiftModel
        .findByIdAndUpdate(operation.id, updateData, { new: true, session })
        .populate('shiftTypeId')
        .populate('userId', 'firstName lastName role avatar')
        .exec();

      if (!updatedShift) {
        console.log('❌ Update failed - shift not found after update');
        throw new Error('Schedule shift not found');
      }

      console.log('✅ Update successful:', {
        id: updatedShift._id,
        newDate: updatedShift.date,
        newUserId: updatedShift.userId,
        newOrder: updatedShift.order
      });

      return {
        type: BulkOperationType.UPDATE,
        success: true,
        clientId: operation.clientId,
        id: operation.id,
        data: this.transformShift(updatedShift),
      };
    } catch (error) {
      console.log('💥 UPDATE ERROR:', error.message);
      throw error;
    }
  }

  private async processBulkDelete(
    scheduleId: string,
    operation: any,
    session: any,
  ): Promise<BulkOperationResultDto> {
    const result = await this.scheduleShiftModel
      .findOneAndDelete({ _id: operation.id, scheduleId })
      .session(session)
      .exec();

    if (!result) {
      throw new Error('Schedule shift not found');
    }

    return {
      type: BulkOperationType.DELETE,
      success: true,
      clientId: operation.clientId,
      id: operation.id,
    };
  }

  private async checkTimeConflictsInSession(
    userId: string,
    date: Date,
    shiftType: ShiftTypeSchemaDocument,
    session: any,
  ): Promise<ScheduleShiftSchemaDocument[]> {
    const sameDay = new Date(date);
    sameDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(sameDay);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingShifts = await this.scheduleShiftModel
      .find({
        userId,
        date: { $gte: sameDay, $lt: nextDay },
      })
      .populate('shiftTypeId')
      .session(session)
      .exec();

    const conflicts: ScheduleShiftSchemaDocument[] = [];

    for (const existing of existingShifts) {
      const existingShiftType = existing.shiftTypeId as any;
      if (timeRangesOverlap(
        { start: shiftType.startTime, end: shiftType.endTime },
        { start: existingShiftType.startTime, end: existingShiftType.endTime }
      )) {
        conflicts.push(existing);
      }
    }

    return conflicts;
  }

  async activateScheduleShifts(scheduleId: string): Promise<void> {
    const scheduleShifts = await this.scheduleShiftModel
      .find({ scheduleId })
      .populate('shiftTypeId')
      .exec();

    for (const shift of scheduleShifts) {
      const shiftType = shift.shiftTypeId as any;
      shift.isActive = true;
      shift.actualStartTime = shiftType.startTime;
      shift.actualEndTime = shiftType.endTime;
      shift.updatedAt = new Date();
      await shift.save();
    }
  }

  private async checkTimeConflicts(
    userId: string,
    date: Date,
    shiftType: ShiftTypeSchemaDocument,
  ): Promise<ScheduleShiftSchemaDocument[]> {
    const sameDay = new Date(date);
    sameDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(sameDay);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingShifts = await this.scheduleShiftModel
      .find({
        userId,
        date: { $gte: sameDay, $lt: nextDay },
      })
      .populate('shiftTypeId')
      .exec();

    const conflicts: ScheduleShiftSchemaDocument[] = [];

    for (const existing of existingShifts) {
      const existingShiftType = existing.shiftTypeId as any;
      if (timeRangesOverlap(
        { start: shiftType.startTime, end: shiftType.endTime },
        { start: existingShiftType.startTime, end: existingShiftType.endTime }
      )) {
        conflicts.push(existing);
      }
    }

    return conflicts;
  }

  private transformShift(shift: any): any {
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