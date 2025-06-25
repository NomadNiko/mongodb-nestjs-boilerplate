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
    return await createdUser.save();
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

    return await this.usersModel
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
      .limit(paginationOptions.limit);
  }

  async findById(id: string): Promise<NullableType<UserSchemaClass>> {
    return await this.usersModel.findById(id);
  }

  async findByEmail(email: string): Promise<NullableType<UserSchemaClass>> {
    if (!email) return null;
    return await this.usersModel.findOne({ email });
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: string;
    provider: string;
  }): Promise<NullableType<UserSchemaClass>> {
    if (!socialId || !provider) return null;
    return await this.usersModel.findOne({ socialId, provider });
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

    return await this.usersModel.findByIdAndUpdate(id, clonedPayload, {
      new: true,
    });
  }

  async remove(id: string): Promise<void> {
    await this.usersModel.deleteOne({ _id: id });
  }
}