import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TimeClockEntriesService } from './time-clock-entries.service';
import { CreateTimeClockEntryDto } from './dto/create-time-clock-entry.dto';
import { UpdateTimeClockEntryDto } from './dto/update-time-clock-entry.dto';
import { TimeClockQueryDto } from './dto/time-clock-query.dto';
import { TimeClockEntryDto } from './dto/time-clock-entry.dto';
import { 
  TimeClockStatusDto, 
  TimeClockSummaryDto, 
  EmployeeTimeClockSummaryDto,
  ActiveEmployeeDto 
} from './dto/time-clock-summary.dto';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Time Clock')
@Controller({
  path: 'time-clock-entries',
  version: '1',
})
export class TimeClockEntriesController {
  constructor(private readonly timeClockEntriesService: TimeClockEntriesService) {}

  // ============================================================================
  // EMPLOYEE ENDPOINTS
  // ============================================================================

  @Post('clock-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clock in the current user' })
  @ApiResponse({
    status: 201,
    description: 'Successfully clocked in',
    type: TimeClockEntryDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Employee is already clocked in' })
  async clockIn(
    @Body() createDto: CreateTimeClockEntryDto,
    @Request() req: any,
  ): Promise<any> {
    return this.timeClockEntriesService.clockIn(req.user.id, createDto);
  }

  @Post('clock-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clock out the current user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully clocked out',
    type: TimeClockEntryDto,
  })
  @ApiResponse({ status: 400, description: 'Employee is not currently clocked in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clockOut(
    @Body() updateDto: UpdateTimeClockEntryDto,
    @Request() req: any,
  ): Promise<any> {
    return this.timeClockEntriesService.clockOut(req.user.id, updateDto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current time clock status for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Current time clock status',
    type: TimeClockStatusDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentStatus(@Request() req: any): Promise<TimeClockStatusDto> {
    return this.timeClockEntriesService.getCurrentStatus(req.user.id);
  }

  @Get('my-entries')
  @ApiOperation({ summary: 'Get time entries for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Time entries for the current user',
    type: [TimeClockEntryDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  async getMyTimeEntries(
    @Query() queryDto: TimeClockQueryDto,
    @Request() req: any,
  ): Promise<any> {
    const result = await this.timeClockEntriesService.getEmployeeTimeEntries(req.user.id, queryDto);
    return {
      ...result,
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  @Get('entry/:id')
  @ApiOperation({ summary: 'Get a specific time entry for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Time entry details',
    type: TimeClockEntryDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  @ApiParam({ name: 'id', description: 'Time entry ID' })
  async getMyTimeEntry(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.timeClockEntriesService.getTimeEntry(id, req.user.id);
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @Get('entries')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all time entries (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All time entries',
    type: [TimeClockEntryDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'employeeId', required: false, description: 'Employee ID filter' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  async getAllTimeEntries(
    @Query() queryDto: TimeClockQueryDto,
  ): Promise<any> {
    const result = await this.timeClockEntriesService.getAllTimeEntries(queryDto);
    return {
      ...result,
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  @Get('active')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all currently clocked in employees (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of currently clocked in employees',
    type: [ActiveEmployeeDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getCurrentlyClockedInEmployees(): Promise<any[]> {
    return this.timeClockEntriesService.getCurrentlyClockedInEmployees();
  }

  @Get('summary')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get time clock summary statistics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Time clock summary statistics',
    type: TimeClockSummaryDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  async getSummaryStatistics(
    @Query() queryDto: TimeClockQueryDto,
  ): Promise<TimeClockSummaryDto> {
    return this.timeClockEntriesService.getSummaryStatistics(queryDto);
  }

  @Get('employee/:employeeId/entries')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get time entries for a specific employee (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Time entries for the specified employee',
    type: [TimeClockEntryDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  async getEmployeeTimeEntries(
    @Param('employeeId') employeeId: string,
    @Query() queryDto: TimeClockQueryDto,
  ): Promise<any> {
    const result = await this.timeClockEntriesService.getEmployeeTimeEntries(employeeId, queryDto);
    return {
      ...result,
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  @Get('employee/:employeeId/summary')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get time clock summary for a specific employee (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Time clock summary for the specified employee',
    type: EmployeeTimeClockSummaryDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  async getEmployeeSummary(
    @Param('employeeId') employeeId: string,
    @Query() queryDto: TimeClockQueryDto,
  ): Promise<EmployeeTimeClockSummaryDto> {
    return this.timeClockEntriesService.getEmployeeSummaryStatistics(employeeId, queryDto);
  }

  @Get('employee/:employeeId/status')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get current time clock status for a specific employee (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Current time clock status for the specified employee',
    type: TimeClockStatusDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  async getEmployeeStatus(
    @Param('employeeId') employeeId: string,
  ): Promise<TimeClockStatusDto> {
    return this.timeClockEntriesService.getCurrentStatus(employeeId);
  }

  @Get('entry/:id/admin')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get a specific time entry (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Time entry details',
    type: TimeClockEntryDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  @ApiParam({ name: 'id', description: 'Time entry ID' })
  async getTimeEntryAdmin(
    @Param('id') id: string,
  ): Promise<any> {
    return this.timeClockEntriesService.getTimeEntry(id);
  }
}