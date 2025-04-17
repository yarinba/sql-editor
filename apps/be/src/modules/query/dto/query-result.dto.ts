import {
  IsArray,
  IsBoolean,
  IsISO8601,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import type {
  QueryColumn,
  QueryError,
  QueryResults,
  QueryExecution,
  QueryStatus,
} from '@sql-editor/types';

/**
 * Validation class for database column in query results
 * Uses QueryColumn interface from shared types
 */
export class QueryColumnDto implements QueryColumn {
  @IsString()
  @Expose()
  name: string;

  @IsString()
  @Expose()
  type: string;
}

/**
 * Validation class for query error
 * Uses QueryError interface from shared types
 */
export class QueryErrorDto implements QueryError {
  @IsString()
  @Expose()
  message: string;

  @IsNumber()
  @IsOptional()
  @Expose()
  line?: number;

  @IsNumber()
  @IsOptional()
  @Expose()
  position?: number;
}

/**
 * Validation class for query results
 * Uses QueryResults interface from shared types
 */
export class QueryResultsDto implements QueryResults {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryColumnDto)
  @Expose()
  columns: QueryColumnDto[];

  @IsArray()
  @Expose()
  rows: any[][];

  @IsNumber()
  @Expose()
  rowCount: number;

  @IsBoolean()
  @Expose()
  truncated: boolean;

  @IsNumber()
  @IsOptional()
  @Expose()
  pageCount?: number;

  @IsNumber()
  @IsOptional()
  @Expose()
  currentPage?: number;
}

/**
 * Validation class for query execution
 * Uses QueryExecution interface from shared types
 */
export class QueryExecutionDto implements QueryExecution {
  @IsString()
  @Expose()
  queryId: string;

  @IsString()
  @Expose()
  status: QueryStatus;

  @IsISO8601()
  @Expose()
  startTime: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QueryErrorDto)
  @Expose()
  error?: QueryErrorDto;
}
