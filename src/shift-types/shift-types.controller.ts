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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ShiftTypesService } from './shift-types.service';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';
import { ShiftTypeDto } from './dto/shift-type.dto';

@ApiTags('Shift Types')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'shift-types', version: '1' })
export class ShiftTypesController {
  constructor(private readonly shiftTypesService: ShiftTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shift type' })
  @ApiResponse({ 
    status: 201, 
    description: 'The shift type has been successfully created.',
    type: ShiftTypeDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createShiftTypeDto: CreateShiftTypeDto): Promise<any> {
    return this.shiftTypesService.create(createShiftTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active shift types' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all active shift types.',
    type: [ShiftTypeDto]
  })
  async findAll(): Promise<any[]> {
    return this.shiftTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shift type by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the shift type.',
    type: ShiftTypeDto
  })
  @ApiResponse({ status: 404, description: 'Shift type not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.shiftTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shift type' })
  @ApiResponse({ 
    status: 200, 
    description: 'The shift type has been successfully updated.',
    type: ShiftTypeDto
  })
  @ApiResponse({ status: 404, description: 'Shift type not found' })
  async update(
    @Param('id') id: string,
    @Body() updateShiftTypeDto: UpdateShiftTypeDto,
  ): Promise<any> {
    return this.shiftTypesService.update(id, updateShiftTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a shift type' })
  @ApiResponse({ status: 204, description: 'The shift type has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Shift type not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete shift type that is used in published schedules' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.shiftTypesService.remove(id);
  }
}