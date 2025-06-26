import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserSchemaClass } from './schemas/user.schema';
import { UsersService } from './users.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Employees')
@Controller({
  path: 'employees',
  version: '1',
})
export class EmployeesController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({
    type: [UserSchemaClass],
    description: 'Get all active employees',
  })
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async findAllEmployees(): Promise<UserSchemaClass[]> {
    return this.usersService.findAllEmployees();
  }
}