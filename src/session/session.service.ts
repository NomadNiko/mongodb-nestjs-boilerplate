import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SessionSchemaClass } from './schemas/session.schema';
import { NullableType } from '../utils/types/nullable.type';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(SessionSchemaClass.name)
    private sessionModel: Model<SessionSchemaClass>,
  ) {}

  async findById(id: string): Promise<NullableType<SessionSchemaClass>> {
    return await this.sessionModel.findById(id);
  }

  async create(data: Partial<SessionSchemaClass>): Promise<SessionSchemaClass> {
    const createdSession = new this.sessionModel(data);
    return await createdSession.save();
  }

  async update(
    id: string,
    payload: Partial<SessionSchemaClass>,
  ): Promise<SessionSchemaClass | null> {
    return await this.sessionModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.sessionModel.deleteOne({ _id: id });
  }

  async deleteByUserId(conditions: { userId: string }): Promise<void> {
    await this.sessionModel.deleteMany({ user: conditions.userId });
  }

  async deleteByUserIdWithExclude(conditions: {
    userId: string;
    excludeSessionId: string;
  }): Promise<void> {
    await this.sessionModel.deleteMany({
      user: conditions.userId,
      _id: { $not: { $eq: conditions.excludeSessionId } },
    });
  }
}