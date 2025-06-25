import { Module } from '@nestjs/common';
import { FilesS3PresignedController } from './files.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilesS3PresignedService } from './files.service';
import { FilesRepositoryService } from '../../../files-repository.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchemaClass, FileSchema } from '../../../schemas/file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileSchemaClass.name, schema: FileSchema },
    ]),
  ],
  controllers: [FilesS3PresignedController],
  providers: [ConfigModule, ConfigService, FilesS3PresignedService, FilesRepositoryService],
  exports: [FilesS3PresignedService],
})
export class FilesS3PresignedModule {}