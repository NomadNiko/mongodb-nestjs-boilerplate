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

  async findById(id: string): Promise<NullableType<FileSchemaClass>> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.fileModel.findById(new Types.ObjectId(id));
  }

  async findByIds(ids: string[]): Promise<FileSchemaClass[]> {
    const validIds = ids.filter(id => Types.ObjectId.isValid(id));
    const objectIds = validIds.map(id => new Types.ObjectId(id));
    return await this.fileModel.find({ _id: { $in: objectIds } });
  }
}