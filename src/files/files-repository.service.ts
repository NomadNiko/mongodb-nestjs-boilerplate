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
    return await createdFile.save();
  }

  async findById(id: string | Types.ObjectId | any): Promise<NullableType<FileSchemaClass>> {
    const objectId = convertToObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.fileModel.findById(objectId);
  }

  async findByIds(ids: (string | Types.ObjectId | any)[]): Promise<FileSchemaClass[]> {
    const query = safeObjectIdQuery(ids);
    return await this.fileModel.find({ _id: query });
  }
}