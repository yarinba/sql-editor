import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { SchemaService } from './schema.service';
import type {
  GetTablesResponse,
  GetTableDetailsResponse,
} from '@sql-editor/types';

@Controller('schema')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Get('tables')
  async getTables(): Promise<GetTablesResponse> {
    return this.schemaService.getTables();
  }

  @Get('tables/:table')
  async getTableInfo(
    @Param('table') tableName: string
  ): Promise<GetTableDetailsResponse> {
    try {
      return await this.schemaService.getTableInfo(tableName);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        `Table '${tableName}' not found or could not be accessed`
      );
    }
  }
}
