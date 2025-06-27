import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';

import { AuthProvidersEnum } from '../../auth/auth-providers.enum';
import { FileSchemaClass } from '../../files/schemas/file.schema';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { StatusSchema } from '../../statuses/schemas/status.schema';
import { RoleSchema } from '../../roles/schemas/role.schema';

export type UserSchemaDocument = HydratedDocument<UserSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class UserSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    unique: true,
  })
  email: string | null;

  @Prop()
  password?: string;

  @Prop({
    default: AuthProvidersEnum.email,
  })
  provider: string;

  @Prop({
    type: String,
    default: null,
  })
  socialId?: string | null;

  @Prop({
    type: String,
  })
  firstName: string | null;

  @Prop({
    type: String,
  })
  lastName: string | null;

  @Prop({
    type: Types.ObjectId,
    ref: FileSchemaClass.name,
  })
  photo?: Types.ObjectId | null;

  @Prop({
    type: RoleSchema,
  })
  role?: RoleSchema | null;

  @Prop({
    type: StatusSchema,
  })
  status?: StatusSchema;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);

UserSchema.index({ 'role._id': 1 });

// Auto-populate photo field
UserSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  this.populate('photo');
});
