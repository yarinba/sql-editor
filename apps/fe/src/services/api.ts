import axios from 'axios';
import {
  ApiResponse,
  GetTablesResponse,
  GetTableDetailsResponse,
  ExecuteQueryRequest,
  ExecuteQueryResponse,
  GetQueryResultsResponse,
  QueryExecution,
} from '@sql-editor/types';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Schema Service API
export const schemaService = {
  // Get all tables
  getTables: async (): Promise<GetTablesResponse> => {
    const response = await api.get<ApiResponse<GetTablesResponse>>(
      '/schema/tables'
    );
    return response.data.data || [];
  },

  // Get table details with columns
  getTableDetails: async (
    tableName: string
  ): Promise<GetTableDetailsResponse> => {
    const response = await api.get<ApiResponse<GetTableDetailsResponse>>(
      `/schema/tables/${tableName}`
    );
    return response.data.data || { name: tableName, columns: [] };
  },
};

// Query Service API
export const queryService = {
  // Execute a SQL query
  executeQuery: async (
    request: ExecuteQueryRequest
  ): Promise<ExecuteQueryResponse> => {
    const response = await api.post<ApiResponse<ExecuteQueryResponse>>(
      '/query/execute',
      request
    );
    return response.data.data as ExecuteQueryResponse;
  },

  // Get query status
  getQueryStatus: async (queryId: string): Promise<QueryExecution> => {
    const response = await api.get<ApiResponse<QueryExecution>>(
      `/query/${queryId}/status`
    );
    return response.data.data as QueryExecution;
  },

  // Get query results
  getQueryResults: async (
    queryId: string,
    page = 1,
    pageSize = 100
  ): Promise<GetQueryResultsResponse> => {
    const response = await api.get<ApiResponse<GetQueryResultsResponse>>(
      `/query/${queryId}/results`,
      { params: { page, pageSize } }
    );
    return response.data.data as GetQueryResultsResponse;
  },

  // Download query results as CSV
  downloadCsv: (queryId: string): void => {
    window.open(`/api/query/${queryId}/download/csv`, '_blank');
  },
};

export default {
  schema: schemaService,
  query: queryService,
};
