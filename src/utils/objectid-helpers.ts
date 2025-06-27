import { Types } from 'mongoose';

export function convertToObjectId(value: any): Types.ObjectId | null {
  try {
    if (typeof value === 'string') {
      if (Types.ObjectId.isValid(value)) {
        return new Types.ObjectId(value);
      }
    } else if (value && typeof value === 'object' && value.buffer) {
      // Handle ObjectId buffer objects
      return new Types.ObjectId(value);
    } else if (value instanceof Types.ObjectId) {
      return value;
    }
  } catch (error) {
    // Return null for invalid values
  }
  return null;
}

export function convertToObjectIds(values: any[]): Types.ObjectId[] {
  const objectIds: Types.ObjectId[] = [];
  
  for (const value of values) {
    const objectId = convertToObjectId(value);
    if (objectId) {
      objectIds.push(objectId);
    }
  }
  
  return objectIds;
}

export function safeObjectIdQuery(ids: any[]) {
  const validObjectIds = convertToObjectIds(ids);
  return validObjectIds.length > 0 ? { $in: validObjectIds } : { $in: [] };
}