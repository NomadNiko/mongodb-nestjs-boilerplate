import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { EmployeesController } from './employees.controller';
import { UsersService } from './users.service';
import { UserSchemaClass, UserSchema } from './schemas/user.schema';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSchemaClass.name, schema: UserSchema },
    ]),
    FilesModule,
  ],
  controllers: [UsersController, EmployeesController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}