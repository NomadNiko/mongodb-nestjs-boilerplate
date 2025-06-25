import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    return await this.fileModel.findById(id);
  }

  async findByIds(ids: string[]): Promise<FileSchemaClass[]> {
    return await this.fileModel.find({ _id: { $in: ids } });
  }
}