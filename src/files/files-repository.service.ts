import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileSchemaClass } from './schemas/file.schema';
import { NullableType } from '../utils/types/nullable.type';

@Injectable()
export class FilesRepositoryService {
  constructor(
    @InjectModel(FileSchemaClass.name)
    private fileModel: Model<FileSchemaClass>,
  ) {}

  async create(data: Omit<FileSchemaClass, '_id'>): Promise<FileSchemaClass> {
    const createdFile = new this.fileModel(data);
    return await createdFile.save();
  }

  async findById(id: string | Types.ObjectId | any): Promise<NullableType<FileSchemaClass>> {
    let objectId: Types.ObjectId;
    
    try {
      if (typeof id === 'string') {
        if (!Types.ObjectId.isValid(id)) {
          return null;
        }
        objectId = new Types.ObjectId(id);
      } else if (id && typeof id === 'object' && id.buffer) {
        // Handle ObjectId buffer objects
        objectId = new Types.ObjectId(id);
      } else if (id instanceof Types.ObjectId) {
        objectId = id;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
    
    return await this.fileModel.findById(objectId);
  }

  async findByIds(ids: (string | Types.ObjectId | any)[]): Promise<FileSchemaClass[]> {
    const objectIds: Types.ObjectId[] = [];
    
    for (const id of ids) {
      try {
        if (typeof id === 'string') {
          if (Types.ObjectId.isValid(id)) {
            objectIds.push(new Types.ObjectId(id));
          }
        } else if (id && typeof id === 'object' && id.buffer) {
          // Handle ObjectId buffer objects
          objectIds.push(new Types.ObjectId(id));
        } else if (id instanceof Types.ObjectId) {
          objectIds.push(id);
        }
      } catch (error) {
        // Skip invalid IDs
        continue;
      }
    }
    
    return await this.fileModel.find({ _id: { $in: objectIds } });
  }
}