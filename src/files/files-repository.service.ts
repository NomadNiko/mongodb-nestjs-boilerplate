import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileSchemaClass } from './schemas/file.schema';
import { NullableType } from '../utils/types/nullable.type';
import { convertToObjectId, safeObjectIdQuery } from '../utils/objectid-helpers';

@Injectable()
export class FilesRepositoryService {
  constructor(
    @InjectModel(FileSchemaClass.name)
    private fileModel: Model<FileSchemaClass>,
  ) {}

  async create(data: Omit<FileSchemaClass, '_id'>): Promise<FileSchemaClass> {
    const createdFile = new this.fileModel(data);
    const savedFile = await createdFile.save();
    
    // Convert to plain object with string _id to avoid ObjectId buffer issues
    const plainFile = savedFile.toJSON();
    plainFile._id = savedFile._id.toString();
    return plainFile;
  }

  async findById(id: string | Types.ObjectId | any): Promise<NullableType<FileSchemaClass>> {
    const objectId = convertToObjectId(id);
    if (!objectId) {
      return null;
    }
    const file = await this.fileModel.findById(objectId);
    if (file) {
      // Convert to plain object with string _id
      const plainFile = file.toJSON();
      plainFile._id = file._id.toString();
      return plainFile;
    }
    return null;
  }

  async findByIds(ids: (string | Types.ObjectId | any)[]): Promise<FileSchemaClass[]> {
    const query = safeObjectIdQuery(ids);
    const files = await this.fileModel.find({ _id: query });
    
    // Convert all files to plain objects with string _id
    return files.map(file => {
      const plainFile = file.toJSON();
      plainFile._id = file._id.toString();
      return plainFile;
    });
  }
}