import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TableDto, TableDetailsDto, ColumnDto } from './dto/table.dto';
import { ConfigService } from '@nestjs/config';
import type {
  GetTablesResponse,
  GetTableDetailsResponse,
} from '@sql-editor/types';

interface TableResult {
  name: string;
  description?: string;
  row_count?: string;
}

interface ColumnResult {
  name: string;
  type: string;
  nullable: boolean;
  is_primary: boolean;
  description?: string;
}

@Injectable()
export class SchemaService {
  private schema: string;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private configService: ConfigService
  ) {
    this.schema = this.configService.get<string>('database.schema', 'public');
  }

  /**
   * Get a list of all tables in the schema
   */
  async getTables(): Promise<GetTablesResponse> {
    // Query the PostgreSQL information_schema for table information
    const tablesQuery = `
      SELECT 
        t.table_name as name,
        obj_description(pgc.oid, 'pg_class') as description,
        (SELECT reltuples::bigint FROM pg_class WHERE oid = pgc.oid) as row_count
      FROM information_schema.tables t
      JOIN pg_catalog.pg_class pgc ON pgc.relname = t.table_name
      WHERE t.table_schema = $1
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name
    `;

    const tables = await this.dataSource.query(tablesQuery, [this.schema]);

    // Transform the results to TableDto objects
    return tables.map((table: TableResult) => {
      const tableDto = new TableDto();
      tableDto.name = table.name;
      tableDto.description = table.description;
      tableDto.rowCount = parseInt(table.row_count ?? '0', 10);
      return tableDto;
    });
  }

  /**
   * Get detailed information about a specific table including its columns
   */
  async getTableInfo(tableName: string): Promise<GetTableDetailsResponse> {
    // First check if table exists
    const tableExists = await this.dataSource.query(
      `SELECT 1 FROM information_schema.tables 
       WHERE table_schema = $1 AND table_name = $2 LIMIT 1`,
      [this.schema, tableName]
    );

    if (!tableExists || tableExists.length === 0) {
      throw new NotFoundException(`Table '${tableName}' not found`);
    }

    // Get table information
    const tableInfoQuery = `
      SELECT 
        t.table_name as name,
        obj_description(pgc.oid, 'pg_class') as description,
        (SELECT reltuples::bigint FROM pg_class WHERE oid = pgc.oid) as row_count
      FROM information_schema.tables t
      JOIN pg_catalog.pg_class pgc ON pgc.relname = t.table_name
      WHERE t.table_schema = $1 AND t.table_name = $2
      LIMIT 1
    `;

    const tableInfo = await this.dataSource.query(tableInfoQuery, [
      this.schema,
      tableName,
    ]);

    if (!tableInfo || tableInfo.length === 0) {
      throw new NotFoundException(`Table '${tableName}' not found`);
    }

    // Get column information
    const columnsQuery = `
      SELECT 
        c.column_name as name,
        c.data_type as type,
        CASE WHEN c.is_nullable = 'YES' THEN true ELSE false END as nullable,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary,
        col_description(pgc.oid, c.ordinal_position) as description
      FROM information_schema.columns c
      JOIN pg_catalog.pg_class pgc ON pgc.relname = c.table_name
      LEFT JOIN (
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = $1
          AND tc.table_name = $2
      ) pk ON pk.column_name = c.column_name
      WHERE c.table_schema = $1 AND c.table_name = $2
      ORDER BY c.ordinal_position
    `;

    const columns = await this.dataSource.query(columnsQuery, [
      this.schema,
      tableName,
    ]);

    // Create a TableDetailsDto instance
    const tableDetails = new TableDetailsDto();
    tableDetails.name = tableInfo[0].name;
    tableDetails.description = tableInfo[0].description;
    tableDetails.rowCount = parseInt(tableInfo[0].row_count, 10) || 0;

    // Map column results to ColumnDto objects
    tableDetails.columns = columns.map((col: ColumnResult) => {
      const columnDto = new ColumnDto();
      columnDto.name = col.name;
      columnDto.type = col.type;
      columnDto.nullable = col.nullable;
      columnDto.isPrimary = col.is_primary;
      columnDto.description = col.description;
      return columnDto;
    });

    return tableDetails;
  }
}
