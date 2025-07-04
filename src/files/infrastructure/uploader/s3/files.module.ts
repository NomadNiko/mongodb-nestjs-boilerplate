import { Module } from '@nestjs/common';
import { FilesS3Controller } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilesS3Service } from './files.service';
import { AllConfigType } from '../../../../config/config.type';
import { FilesRepositoryService } from '../../../files-repository.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchemaClass, FileSchema } from '../../../schemas/file.schema';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileSchemaClass.name, schema: FileSchema },
    ]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const s3 = new S3Client({
          region: configService.get('file.awsS3Region', { infer: true }),
          credentials: {
            accessKeyId: configService.getOrThrow('file.accessKeyId', {
              infer: true,
            }),
            secretAccessKey: configService.getOrThrow('file.secretAccessKey', {
              infer: true,
            }),
          },
        });

        return {
          storage: multerS3({
            s3: s3,
            bucket: configService.getOrThrow('file.awsDefaultS3Bucket', {
              infer: true,
            }),
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (request, file, callback) => {
              callback(
                null,
                `${randomStringGenerator()}.${file.originalname
                  .split('.')
                  .pop()
                  ?.toLowerCase()}`,
              );
            },
          }),
          limits: {
            fileSize: configService.get('file.maxFileSize', { infer: true }),
          },
        };
      },
    }),
  ],
  controllers: [FilesS3Controller],
  providers: [ConfigModule, ConfigService, FilesS3Service, FilesRepositoryService],
  exports: [FilesS3Service],
})
export class FilesS3Module {}