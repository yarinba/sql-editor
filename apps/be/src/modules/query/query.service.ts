import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ExecuteQueryDto } from './dto/execute-query.dto';
import {
  QueryExecutionDto,
  QueryResultsDto,
  QueryColumnDto,
  QueryErrorDto,
} from './dto/query-result.dto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvStringifier } from 'csv-writer';

interface ActiveQuery {
  id: string;
  queryRunner: QueryRunner;
  startTime: Date;
  status: 'running' | 'completed' | 'error';
  results?: QueryResultsDto;
  error?: QueryErrorDto;
}

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);
  private readonly activeQueries = new Map<string, ActiveQuery>();
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_ROWS = 10000; // Maximum number of rows to return
  private readonly MAX_CSV_ROWS = 100000; // Maximum number of rows for CSV export
  private readonly schema: string;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private configService: ConfigService
  ) {
    this.schema = this.configService.get<string>('database.schema', 'public');
  }

  /**
   * Execute a SQL query
   */
  async executeQuery(
    executeQueryDto: ExecuteQueryDto
  ): Promise<QueryExecutionDto> {
    const { sql, timeout = this.DEFAULT_TIMEOUT } = executeQueryDto;

    if (!sql || !sql.trim()) {
      throw new BadRequestException('SQL query cannot be empty');
    }

    // Simple validation to ensure the query is read-only
    const normalizedSql = sql.trim().toLowerCase();
    if (this.isMutatingQuery(normalizedSql)) {
      throw new BadRequestException('Only SELECT queries are allowed');
    }

    const queryId = uuidv4();
    const startTime = new Date();

    // Create a query runner for this query
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    // Create an active query entry
    const activeQuery: ActiveQuery = {
      id: queryId,
      queryRunner,
      startTime,
      status: 'running',
    };

    this.activeQueries.set(queryId, activeQuery);

    // Execute the query asynchronously
    this.executeQueryAsync(queryId, sql, timeout);

    // Return immediately with the query ID
    return {
      queryId,
      status: 'running',
      startTime: startTime.toISOString(),
    };
  }

  /**
   * Get the status of a running query
   */
  async getQueryStatus(queryId: string): Promise<QueryExecutionDto> {
    const activeQuery = this.activeQueries.get(queryId);

    if (!activeQuery) {
      throw new NotFoundException(`Query with ID '${queryId}' not found`);
    }

    const result: QueryExecutionDto = {
      queryId: activeQuery.id,
      status: activeQuery.status,
      startTime: activeQuery.startTime.toISOString(),
    };

    if (activeQuery.status === 'error' && activeQuery.error) {
      result.error = activeQuery.error;
    }

    return result;
  }

  /**
   * Get the results of a completed query
   */
  async getQueryResults(
    queryId: string,
    page = 1,
    pageSize = 100
  ): Promise<QueryResultsDto> {
    const activeQuery = this.activeQueries.get(queryId);

    if (!activeQuery) {
      throw new NotFoundException(`Query with ID '${queryId}' not found`);
    }

    if (activeQuery.status === 'running') {
      throw new BadRequestException('Query is still running');
    }

    if (activeQuery.status === 'error') {
      throw new BadRequestException('Query failed with an error');
    }

    if (!activeQuery.results) {
      throw new BadRequestException('No results available for this query');
    }

    // If requested page size is too large, cap it
    const actualPageSize = Math.min(pageSize, 1000);

    // Calculate pagination
    const start = (page - 1) * actualPageSize;
    const end = start + actualPageSize;
    const totalPages = Math.ceil(activeQuery.results.rowCount / actualPageSize);

    // Slice the rows for the requested page
    const pagedRows = activeQuery.results.rows.slice(start, end);

    return {
      columns: activeQuery.results.columns,
      rows: pagedRows,
      rowCount: activeQuery.results.rowCount,
      truncated: activeQuery.results.truncated,
      pageCount: totalPages,
      currentPage: page,
    };
  }

  /**
   * Generate a CSV file for query results
   */
  async generateCsvForQuery(
    queryId: string
  ): Promise<{ filePath: string; fileName: string }> {
    const activeQuery = this.activeQueries.get(queryId);

    if (!activeQuery) {
      throw new NotFoundException(`Query with ID '${queryId}' not found`);
    }

    if (activeQuery.status === 'running') {
      throw new BadRequestException('Query is still running');
    }

    if (activeQuery.status === 'error') {
      throw new BadRequestException('Query failed with an error');
    }

    if (!activeQuery.results) {
      throw new BadRequestException('No results available for this query');
    }

    // Create temporary directory if it doesn't exist
    const tempDir = path.resolve(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate file name and path
    const fileName = `query_results_${queryId}.csv`;
    const filePath = path.join(tempDir, fileName);

    // Create CSV header from column names
    const header = activeQuery.results.columns.map((col) => ({
      id: col.name,
      title: col.name,
    }));

    // Create CSV stringifier
    const csvStringifier = createObjectCsvStringifier({
      header,
    });

    // Convert rows to objects
    const records = activeQuery.results.rows.map((row) => {
      const record: Record<string, any> = {};
      header.forEach((col, index) => {
        record[col.id] = row[index];
      });
      return record;
    });

    // Write CSV header and records
    const csvString =
      csvStringifier.getHeaderString() +
      csvStringifier.stringifyRecords(records);
    fs.writeFileSync(filePath, csvString);

    return { filePath, fileName };
  }

  /**
   * Check if a query is a mutating query
   */
  private isMutatingQuery(sql: string): boolean {
    // Check if the query starts with a mutating statement
    const mutatingKeywords = [
      'insert',
      'update',
      'delete',
      'drop',
      'create',
      'alter',
      'truncate',
      'rename',
      'grant',
      'revoke',
      'commit',
      'rollback',
      'begin',
      'start',
    ];

    // Simple check - we might want to use a proper SQL parser for production
    for (const keyword of mutatingKeywords) {
      if (
        sql.toLowerCase().startsWith(keyword) ||
        sql.toLowerCase().includes(`;${keyword}`)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Execute query asynchronously and store results
   */
  private async executeQueryAsync(
    queryId: string,
    sql: string,
    timeoutMs: number
  ): Promise<void> {
    const activeQuery = this.activeQueries.get(queryId);

    if (!activeQuery) {
      this.logger.error(`Query ${queryId} not found in active queries`);
      return;
    }

    try {
      // Set query timeout using statement_timeout
      await activeQuery.queryRunner.query(
        `SET statement_timeout = ${timeoutMs}`
      );

      // If schema is specified, set search_path
      if (this.schema && this.schema !== 'public') {
        await activeQuery.queryRunner.query(
          `SET search_path TO ${this.schema}, public`
        );
      }

      // Execute the query
      const startTime = Date.now();
      const result = await activeQuery.queryRunner.query(sql);
      const duration = Date.now() - startTime;

      // Process the results
      let rows: any[] = [];
      let columns: QueryColumnDto[] = [];
      let truncated = false;

      if (Array.isArray(result) && result.length > 0) {
        // Extract column information from the first row
        if (typeof result[0] === 'object' && result[0] !== null) {
          columns = Object.keys(result[0]).map((key) => ({
            name: key,
            // Try to infer type from values
            type: this.inferType(result[0][key]),
          }));
        }

        // Check if we need to truncate the results
        truncated = result.length > this.MAX_ROWS;
        const limitedResult = truncated
          ? result.slice(0, this.MAX_ROWS)
          : result;

        // Convert results to row arrays
        rows = limitedResult.map((row) => columns.map((col) => row[col.name]));
      }

      // Store the results
      activeQuery.status = 'completed';
      activeQuery.results = {
        columns,
        rows,
        rowCount: result.length || 0,
        truncated,
      };

      this.logger.log(
        `Query ${queryId} completed in ${duration}ms with ${rows.length} rows`
      );
    } catch (error) {
      this.logger.error(`Query ${queryId} failed: ${error.message}`);

      // Store the error
      activeQuery.status = 'error';
      activeQuery.error = {
        message: error.message,
        line: error.position?.line || undefined,
        position: error.position?.column || undefined,
      };
    } finally {
      // Clean up after a while (5 minutes)
      setTimeout(() => {
        const query = this.activeQueries.get(queryId);
        if (query) {
          // Release the query runner
          query.queryRunner.release();
          this.activeQueries.delete(queryId);
          this.logger.log(`Cleaned up query ${queryId}`);
        }
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Infer the type of a value
   */
  private inferType(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'INTEGER' : 'NUMERIC';
    }

    if (typeof value === 'boolean') {
      return 'BOOLEAN';
    }

    if (value instanceof Date) {
      return 'TIMESTAMP';
    }

    if (Array.isArray(value)) {
      return 'ARRAY';
    }

    if (typeof value === 'object') {
      return 'JSON';
    }

    return 'VARCHAR';
  }
}
