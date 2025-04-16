import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import type { Column, Table, TableDetails } from '@sql-editor/types';

/**
 * Validation class for database column metadata
 * Uses Column interface from shared types
 */
export class ColumnDto implements Column {
  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsString()
  type!: string;

  @Expose()
  @IsBoolean()
  nullable!: boolean;

  @Expose()
  @IsBoolean()
  isPrimary!: boolean;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * Validation class for table with basic information
 * Uses Table interface from shared types
 */
export class TableDto implements Table {
  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  rowCount?: number;
}

/**
 * Validation class for table with detailed information including columns
 * Uses TableDetails interface from shared types
 */
export class TableDetailsDto extends TableDto implements TableDetails {
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ColumnDto)
  columns!: ColumnDto[];
}
