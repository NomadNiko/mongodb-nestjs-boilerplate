import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FilesRepositoryService } from '../../../files-repository.service';
import { FileSchemaClass } from '../../../schemas/file.schema';

@Injectable()
export class FilesS3Service {
  constructor(private readonly filesRepositoryService: FilesRepositoryService) {}

  async create(file: Express.MulterS3.File): Promise<{ file: FileSchemaClass }> {
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
        path: file.key,
      }),
    };
  }
}