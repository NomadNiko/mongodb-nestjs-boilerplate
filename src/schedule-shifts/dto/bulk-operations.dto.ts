import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, ValidateNested, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateScheduleShiftDto } from './create-schedule-shift.dto';
import { UpdateScheduleShiftDto } from './update-schedule-shift.dto';

export enum BulkOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export class BulkCreateOperationDto {
  @ApiProperty({ enum: BulkOperationType, example: BulkOperationType.CREATE })
  @IsNotEmpty()
  @IsEnum(BulkOperationType)
  type: BulkOperationType.CREATE;

  @ApiProperty({ 
    type: 'object',
    properties: {
      shiftTypeId: { type: 'string' },
      date: { type: 'string', format: 'date' },
      order: { type: 'number', minimum: 1 },
      userId: { type: 'string', nullable: true }
    }
  })
  @IsNotEmpty()
  @ValidateNested()
  data: {
    shiftTypeId: string;
    date: string;
    order?: number;
    userId?: string;
  };

  @ApiProperty({ 
    description: 'Optional client-side ID for tracking this operation',
    required: false 
  })
  @IsOptional()
  @IsString()
  clientId?: string;
}

export class BulkUpdateOperationDto {
  @ApiProperty({ enum: BulkOperationType, example: BulkOperationType.UPDATE })
  @IsNotEmpty()
  @IsEnum(BulkOperationType)
  type: BulkOperationType.UPDATE;

  @ApiProperty({ description: 'ID of the shift to update' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ type: UpdateScheduleShiftDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateScheduleShiftDto)
  data: UpdateScheduleShiftDto;

  @ApiProperty({ 
    description: 'Optional client-side ID for tracking this operation',
    required: false 
  })
  @IsOptional()
  @IsString()
  clientId?: string;
}

export class BulkDeleteOperationDto {
  @ApiProperty({ enum: BulkOperationType, example: BulkOperationType.DELETE })
  @IsNotEmpty()
  @IsEnum(BulkOperationType)
  type: BulkOperationType.DELETE;

  @ApiProperty({ description: 'ID of the shift to delete' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ 
    description: 'Optional client-side ID for tracking this operation',
    required: false 
  })
  @IsOptional()
  @IsString()
  clientId?: string;
}

export type BulkOperationDto = BulkCreateOperationDto | BulkUpdateOperationDto | BulkDeleteOperationDto;

export class BulkOperationsDto {
  @ApiProperty({ 
    type: 'array',
    items: {
      oneOf: [
        { $ref: '#/components/schemas/BulkCreateOperationDto' },
        { $ref: '#/components/schemas/BulkUpdateOperationDto' },
        { $ref: '#/components/schemas/BulkDeleteOperationDto' },
      ]
    },
    description: 'Array of operations to perform'
  })
  @IsNotEmpty()
  @IsArray()
  operations: any[]; // Use any[] to bypass validation issues with union types
}

export class BulkOperationResultDto {
  @ApiProperty({ description: 'Operation type' })
  type: BulkOperationType;

  @ApiProperty({ description: 'Whether the operation succeeded' })
  success: boolean;

  @ApiProperty({ description: 'Client ID if provided', required: false })
  clientId?: string;

  @ApiProperty({ description: 'Server-generated ID for create operations', required: false })
  id?: string;

  @ApiProperty({ description: 'Error message if operation failed', required: false })
  error?: string;

  @ApiProperty({ description: 'The shift data for successful operations', required: false })
  data?: any;
}

export class BulkOperationsResponseDto {
  @ApiProperty({ type: [BulkOperationResultDto] })
  results: BulkOperationResultDto[];

  @ApiProperty({ description: 'Total number of operations processed' })
  totalOperations: number;

  @ApiProperty({ description: 'Number of successful operations' })
  successfulOperations: number;

  @ApiProperty({ description: 'Number of failed operations' })
  failedOperations: number;

  @ApiProperty({ description: 'Whether all operations succeeded' })
  allSuccessful: boolean;
}