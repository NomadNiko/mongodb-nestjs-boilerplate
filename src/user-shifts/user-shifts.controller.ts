import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserShiftsService } from './user-shifts.service';
import { ScheduleShiftDto } from '../schedule-shifts/dto/schedule-shift.dto';

@ApiTags('User Shifts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'user-shifts', version: '1' })
export class UserShiftsController {
  constructor(private readonly userShiftsService: UserShiftsService) {}

  @Get('my-shifts')
  @ApiOperation({ summary: 'Get all shifts assigned to the current user across all published schedules' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all shifts assigned to the current user.',
    type: [ScheduleShiftDto]
  })
  async getMyShifts(@Request() req: any): Promise<ScheduleShiftDto[]> {
    return this.userShiftsService.getUserShifts(req.user.id);
  }
}