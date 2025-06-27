import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { UserSchemaClass } from './schemas/user.schema';
import { IPaginationOptions } from '../utils/types/pagination-options';
import bcrypt from 'bcryptjs';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { FilesService } from '../files/files.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly usersModel: Model<UserSchemaClass>,
    private readonly filesService: FilesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserSchemaClass> {
    const clonedPayload = {
      provider: AuthProvidersEnum.email,
      ...createUserDto,
    };

    if (clonedPayload.password) {
      const salt = await bcrypt.genSalt();
      clonedPayload.password = await bcrypt.hash(clonedPayload.password, salt);
    }

    if (clonedPayload.email) {
      clonedPayload.email = clonedPayload.email.toLowerCase();
    }

    if (!clonedPayload.role?.id) {
      clonedPayload.role = {
        id: '1',
      };
    }

    const createdUser = new this.usersModel(clonedPayload);
    const savedUser = await createdUser.save();
    
    // Convert to clean JSON
    const userJson = savedUser.toJSON();
    userJson._id = userJson._id.toString();
    return userJson;
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<UserSchemaClass[]> {
    const where: FilterQuery<UserSchemaClass> = {};
    if (filterOptions?.roles?.length) {
      where['role._id'] = {
        $in: filterOptions.roles.map((role) => role.id.toString()),
      };
    }

    const users = await this.usersModel
      .find(where)
      .sort(
        sortOptions?.reduce(
          (accumulator, sort) => ({
            ...accumulator,
            [sort.orderBy === '_id' ? '_id' : sort.orderBy]:
              sort.order.toUpperCase() === 'ASC' ? 1 : -1,
          }),
          {},
        ),
      )
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit)
      .lean();

    return users.map(user => {
      // Ensure clean JSON serialization
      const cleanUser = JSON.parse(JSON.stringify(user));
      cleanUser._id = user._id.toString();
      return cleanUser;
    });
  }

  async findById(id: string): Promise<NullableType<UserSchemaClass>> {
    const user = await this.usersModel.findById(id).lean();
    if (user) {
      // Convert ObjectId to string
      user._id = user._id.toString();
    }
    return user;
  }

  async findByEmail(email: string): Promise<NullableType<UserSchemaClass>> {
    if (!email) return null;
    const user = await this.usersModel.findOne({ email }).lean();
    if (user) {
      // Convert ObjectId to string
      user._id = user._id.toString();
    }
    return user;
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: string;
    provider: string;
  }): Promise<NullableType<UserSchemaClass>> {
    if (!socialId || !provider) return null;
    const user = await this.usersModel.findOne({ socialId, provider }).lean();
    if (user) {
      // Convert ObjectId to string
      user._id = user._id.toString();
    }
    return user;
  }

  async update(
    id: string,
    payload: UpdateUserDto | Partial<UserSchemaClass>,
  ): Promise<UserSchemaClass | null> {
    const clonedPayload = { ...payload };

    if (clonedPayload.password) {
      const salt = await bcrypt.genSalt();
      clonedPayload.password = await bcrypt.hash(clonedPayload.password, salt);
    }

    if (clonedPayload.email) {
      clonedPayload.email = clonedPayload.email.toLowerCase();
    }

    if (clonedPayload.photo && 'id' in clonedPayload.photo && clonedPayload.photo?.id === null) {
      clonedPayload.photo = null;
    }

    const user = await this.usersModel.findByIdAndUpdate(id, clonedPayload, {
      new: true,
    }).lean();
    if (user) {
      // Convert ObjectId to string
      user._id = user._id.toString();
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    await this.usersModel.deleteOne({ _id: id });
  }

  async findAllEmployees(): Promise<UserSchemaClass[]> {
    const users = await this.usersModel
      .find({ 'status._id': '1' }) // Active status has _id: '1'
      .select('_id email firstName lastName role')
      .lean();
    
    return users.map(user => {
      // Ensure clean JSON serialization
      const cleanUser = JSON.parse(JSON.stringify(user));
      cleanUser._id = user._id.toString();
      return cleanUser;
    });
  }
}