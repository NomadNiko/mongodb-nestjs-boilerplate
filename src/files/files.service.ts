import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FilesRepositoryService } from './files-repository.service';
import { FileSchemaClass } from './schemas/file.schema';
import { NullableType } from '../utils/types/nullable.type';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepositoryService: FilesRepositoryService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  findById(id: string): Promise<NullableType<FileSchemaClass>> {
    return this.filesRepositoryService.findById(id);
  }

  findByIds(ids: string[]): Promise<FileSchemaClass[]> {
    return this.filesRepositoryService.findByIds(ids);
  }

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