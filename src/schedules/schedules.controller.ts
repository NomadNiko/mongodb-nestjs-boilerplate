import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  SerializeOptions,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { ScheduleDto } from './dto/schedule.dto';

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'schedules', version: '1' })
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new schedule' })
  @ApiResponse({ 
    status: 201, 
    description: 'The schedule has been successfully created.',
    type: ScheduleDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
    @Request() req: any,
  ): Promise<any> {
    return this.schedulesService.create(createScheduleDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedules with optional filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all schedules.',
    type: [ScheduleDto]
  })
  async findAll(@Query() queryDto: QueryScheduleDto): Promise<any[]> {
    return this.schedulesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a schedule by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the schedule.',
    type: ScheduleDto
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a schedule' })
  @ApiResponse({ 
    status: 200, 
    description: 'The schedule has been successfully updated.',
    type: ScheduleDto
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<any> {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a schedule' })
  @ApiResponse({ status: 204, description: 'The schedule has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.schedulesService.remove(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a schedule' })
  @ApiResponse({ 
    status: 200, 
    description: 'The schedule has been successfully published.',
    type: ScheduleDto
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async publish(@Param('id') id: string): Promise<any> {
    return this.schedulesService.publish(id);
  }
}