import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  SerializeOptions,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ScheduleShiftsService } from './schedule-shifts.service';
import { CreateScheduleShiftDto } from './dto/create-schedule-shift.dto';
import { UpdateScheduleShiftDto } from './dto/update-schedule-shift.dto';
import { UpdateShiftTimesDto } from './dto/update-shift-times.dto';
import { ScheduleShiftDto, ScheduleShiftsResponseDto } from './dto/schedule-shift.dto';
import { CopyPreviousResponseDto } from './dto/copy-previous-response.dto';
import { BulkOperationsDto, BulkOperationsResponseDto } from './dto/bulk-operations.dto';

@ApiTags('Schedule Shifts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'schedules/:scheduleId/shifts', version: '1' })
export class ScheduleShiftsController {
  constructor(private readonly scheduleShiftsService: ScheduleShiftsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a shift to a calendar day' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID' })
  @ApiResponse({ 
    status: 201, 
    description: 'The shift has been successfully added to the schedule.',
    type: ScheduleShiftDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Schedule or Shift Type not found' })
  async create(
    @Param('scheduleId') scheduleId: string,
    @Body() createScheduleShiftDto: CreateScheduleShiftDto,
  ): Promise<any> {
    return this.scheduleShiftsService.create(scheduleId, createScheduleShiftDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shifts for a schedule' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all shifts for the schedule, separated by assigned and unassigned.',
    type: ScheduleShiftsResponseDto
  })
  async findBySchedule(@Param('scheduleId') scheduleId: string): Promise<ScheduleShiftsResponseDto> {
    return this.scheduleShiftsService.findBySchedule(scheduleId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Assign user to shift or reorder shift' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID' })
  @ApiParam({ name: 'id', description: 'Schedule Shift ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The shift has been successfully updated.',
    type: ScheduleShiftDto
  })
  @ApiResponse({ status: 404, description: 'Schedule shift not found' })
  @ApiResponse({ status: 409, description: 'User has conflicting shifts' })
  async update(
    @Param('scheduleId') scheduleId: string,
    @Param('id') id: string,
    @Body() updateScheduleShiftDto: UpdateScheduleShiftDto,
  ): Promise<any> {
    return this.scheduleShiftsService.update(scheduleId, id, updateScheduleShiftDto);
  }

  @Patch(':id/times')
  @ApiOperation({ summary: 'Adjust actual start and end times (published schedules only)' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID' })
  @ApiParam({ name: 'id', description: 'Schedule Shift ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The shift times have been successfully updated.',
    type: ScheduleShiftDto
  })
  @ApiResponse({ status: 400, description: 'Can only adjust times on published schedule shifts' })
  @ApiResponse({ status: 404, description: 'Schedule shift not found' })
  async updateTimes(
    @Param('scheduleId') scheduleId: string,
    @Param('id') id: string,
    @Body() updateShiftTimesDto: UpdateShiftTimesDto,
  ): Promise<any> {
    return this.scheduleShiftsService.updateTimes(scheduleId, id, updateShiftTimesDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a shift from the schedule' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID' })
  @ApiParam({ name: 'id', description: 'Schedule Shift ID' })
  @ApiResponse({ status: 204, description: 'The shift has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Schedule shift not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('scheduleId') scheduleId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.scheduleShiftsService.remove(scheduleId, id);
  }

  @Post('copy-previous')
  @ApiOperation({ summary: 'Copy shifts from the most recent published schedule' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID' })
  @ApiResponse({ 
    status: 201, 
    description: 'Shifts have been successfully copied from previous schedule.',
    type: CopyPreviousResponseDto
  })
  @ApiResponse({ status: 404, description: 'Schedule not found or no previous published schedule' })
  async copyPrevious(@Param('scheduleId') scheduleId: string): Promise<CopyPreviousResponseDto> {
    return this.scheduleShiftsService.copyPrevious(scheduleId);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Perform bulk operations on schedule shifts (create, update, delete)' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID' })
  @ApiResponse({ 
    status: 201, 
    description: 'Bulk operations have been processed.',
    type: BulkOperationsResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async bulkOperations(
    @Param('scheduleId') scheduleId: string,
    @Body() bulkOperationsDto: BulkOperationsDto,
  ): Promise<BulkOperationsResponseDto> {
    return this.scheduleShiftsService.bulkOperations(scheduleId, bulkOperationsDto);
  }
}