import { ApiProperty } from '@nestjs/swagger';
import { FileSchemaClass } from '../../../../schemas/file.schema';

export class FileResponseDto {
  @ApiProperty({
    type: () => FileSchemaClass,
  })
  file: FileSchemaClass;
}
