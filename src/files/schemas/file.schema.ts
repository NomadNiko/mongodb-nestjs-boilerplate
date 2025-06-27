import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type FileSchemaDocument = HydratedDocument<FileSchemaClass>;

@Schema({
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class FileSchemaClass extends EntityDocumentHelper {
  @Prop()
  path: string;
}

export const FileSchema = SchemaFactory.createForClass(FileSchemaClass);

// Add custom ObjectId casting to handle buffer objects
FileSchema.path('_id').cast(function(value) {
  if (value && typeof value === 'object' && value.buffer) {
    // Handle ObjectId buffer objects
    return new Types.ObjectId(value);
  }
  if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
    return new Types.ObjectId(value);
  }
  if (value instanceof Types.ObjectId) {
    return value;
  }
  return value;
});
