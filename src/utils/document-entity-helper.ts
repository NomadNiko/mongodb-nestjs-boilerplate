import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class EntityDocumentHelper {
  @Transform(
    (value) => {
      if ('value' in value) {
        // https://github.com/typestack/class-transformer/issues/879
        const objectId = value.obj[value.key];
        if (objectId && typeof objectId === 'object' && objectId.toString) {
          return objectId.toString();
        }
        if (typeof objectId === 'string') {
          return objectId;
        }
        if (objectId && typeof objectId === 'object' && objectId.buffer) {
          // Handle ObjectId buffer objects
          return new Types.ObjectId(objectId).toString();
        }
      }

      return 'unknown value';
    },
    {
      toPlainOnly: true,
    },
  )
  public _id: string;
}
