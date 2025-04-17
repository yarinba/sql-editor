import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import type { ExecuteQueryRequest } from '@sql-editor/types';

/**
 * Validation class for query execution request
 * Uses ExecuteQueryRequest interface from shared types
 */
export class ExecuteQueryDto implements ExecuteQueryRequest {
  @IsString()
  sql: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  timeout?: number;
}
