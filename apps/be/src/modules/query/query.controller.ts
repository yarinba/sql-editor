import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Res,
  NotFoundException,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { QueryService } from './query.service';
import { ExecuteQueryDto } from './dto/execute-query.dto';
import type {
  ExecuteQueryResponse,
  GetQueryStatusResponse,
  GetQueryResultsResponse,
} from '@sql-editor/types';

@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post('execute')
  async executeQuery(
    @Body(ValidationPipe) executeQueryDto: ExecuteQueryDto
  ): Promise<ExecuteQueryResponse> {
    return this.queryService.executeQuery(executeQueryDto);
  }

  @Get(':queryId/status')
  async getQueryStatus(
    @Param('queryId') queryId: string
  ): Promise<GetQueryStatusResponse> {
    try {
      return await this.queryService.getQueryStatus(queryId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get query status');
    }
  }

  @Get(':queryId/results')
  async getQueryResults(
    @Param('queryId') queryId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<GetQueryResultsResponse> {
    try {
      return await this.queryService.getQueryResults(
        queryId,
        page ? parseInt(page.toString(), 10) : 1,
        pageSize ? parseInt(pageSize.toString(), 10) : 100
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to get query results');
    }
  }

  @Get(':queryId/download/csv')
  async downloadCsv(
    @Param('queryId') queryId: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const { filePath, fileName } =
        await this.queryService.generateCsvForQuery(queryId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      );

      // Stream the file to the response
      res.download(filePath, fileName, (err) => {
        if (err) {
          // Handle errors (e.g., file not found)
          res.status(500).send('Error downloading file');
        }
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to generate CSV file');
    }
  }
}
