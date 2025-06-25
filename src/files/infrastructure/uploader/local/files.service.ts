import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesRepositoryService } from '../../../files-repository.service';
import { AllConfigType } from '../../../../config/config.type';
import { FileSchemaClass } from '../../../schemas/file.schema';

@Injectable()
export class FilesLocalService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly filesRepositoryService: FilesRepositoryService,
  ) {}

  async create(file: Express.Multer.File): Promise<{ file: FileSchemaClass }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      });
    }

    return {
      file: await this.filesRepositoryService.create({
        path: `/${this.configService.get('app.apiPrefix', { infer: true })}/v1/${
          file.path
        }`,
      }),
    };
  }
}