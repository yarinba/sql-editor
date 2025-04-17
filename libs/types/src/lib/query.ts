/**
 * Types for SQL query execution
 */

/**
 * Possible query execution status values
 */
export type QueryStatus = 'running' | 'completed' | 'error';

/**
 * Represents a database column in query results
 */
export interface QueryColumn {
  name: string;
  type: string;
}

/**
 * Represents an error that occurred during query execution
 */
export interface QueryError {
  message: string;
  line?: number;
  position?: number;
}

/**
 * Represents query execution results
 */
export interface QueryResults {
  columns: QueryColumn[];
  rows: any[][];
  rowCount: number;
  truncated: boolean;
  pageCount?: number;
  currentPage?: number;
}

/**
 * Represents the status and results of a query execution
 */
export interface QueryExecution {
  queryId: string;
  status: QueryStatus;
  startTime: string;
  error?: QueryError;
}

/**
 * Query API request and response types
 */

// Execute Query
export interface ExecuteQueryRequest {
  sql: string;
  timeout?: number;
}

export type ExecuteQueryResponse = QueryExecution;

// Query Status
export type GetQueryStatusResponse = QueryExecution;

// Query Results
export interface GetQueryResultsRequest {
  page?: number;
  pageSize?: number;
}

export type GetQueryResultsResponse = QueryResults;

/**
 * Saved Queries types (optional feature)
 */
export interface SavedQuery {
  id: string;
  name: string;
  description?: string;
  sql: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveQueryRequest {
  name: string;
  description?: string;
  sql: string;
}

export interface UpdateQueryRequest {
  name?: string;
  description?: string;
  sql?: string;
}

export interface GetQueriesResponse {
  queries: SavedQuery[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
}
