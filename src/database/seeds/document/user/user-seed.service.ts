import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { RoleEnum } from '../../../../roles/roles.enum';
import { StatusEnum } from '../../../../statuses/statuses.enum';
import { UserSchemaClass } from '../../../../users/schemas/user.schema';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly model: Model<UserSchemaClass>,
  ) {}

  async run() {
    const admin = await this.model.findOne({
      email: 'admin@nomadsoft.us',
    });

    if (!admin) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      const data = new this.model({
        email: 'admin@nomadsoft.us',
        password: password,
        firstName: 'Super',
        lastName: 'Admin',
        role: {
          id: RoleEnum.admin.toString(),
          _id: RoleEnum.admin.toString(),
        },
        status: {
          id: StatusEnum.active.toString(),
          _id: StatusEnum.active.toString(),
        },
      });
      await data.save();
      console.log('✅ Admin user created: admin@nomadsoft.us');
    } else {
      console.log('ℹ️ Admin user already exists: admin@nomadsoft.us');
    }

    const user = await this.model.findOne({
      email: 'user@nomadsoft.us',
    });

    if (!user) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      const data = new this.model({
        email: 'user@nomadsoft.us',
        password: password,
        firstName: 'Test',
        lastName: 'User',
        role: {
          id: RoleEnum.user.toString(),
          _id: RoleEnum.user.toString(),
        },
        status: {
          id: StatusEnum.active.toString(),
          _id: StatusEnum.active.toString(),
        },
      });

      await data.save();
      console.log('✅ Test user created: user@nomadsoft.us');
    } else {
      console.log('ℹ️ Test user already exists: user@nomadsoft.us');
    }
  }
}
