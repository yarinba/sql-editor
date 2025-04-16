import { create } from 'zustand';
import {
  ExecuteQueryRequest,
  QueryExecution,
  QueryResults,
  QueryStatus,
} from '@sql-editor/types';
import { queryService } from '../services/api';

interface QueryState {
  sql: string;
  execution: QueryExecution | null;
  results: QueryResults | null;
  status: QueryStatus | 'idle';
  loading: boolean;
  error: string | null;

  setSql: (sql: string) => void;
  executeQuery: (timeout?: number) => Promise<void>;
  checkQueryStatus: (queryId: string) => Promise<void>;
  fetchQueryResults: (
    queryId: string,
    page?: number,
    pageSize?: number
  ) => Promise<void>;
  downloadCsv: (queryId: string) => void;
  reset: () => void;
}

export const useQueryStore = create<QueryState>((set, get) => ({
  sql: '',
  execution: null,
  results: null,
  status: 'idle',
  loading: false,
  error: null,

  setSql: (sql: string) => set({ sql }),

  executeQuery: async (timeout?: number) => {
    set({ loading: true, error: null, status: 'running' });
    try {
      const request: ExecuteQueryRequest = {
        sql: get().sql,
        ...(timeout ? { timeout } : {}),
      };

      const execution = await queryService.executeQuery(request);
      set({ execution, loading: false, status: execution.status });

      // If query is completed, set the results
      if (execution.status === 'completed' && execution.results) {
        set({ results: execution.results });
      }

      // If query is still running, poll for status
      if (execution.status === 'running') {
        setTimeout(() => {
          get().checkQueryStatus(execution.queryId);
        }, 1000);
      }
    } catch (error) {
      console.error('Error executing query:', error);
      set({
        loading: false,
        status: 'error',
        error:
          error instanceof Error ? error.message : 'Failed to execute query',
      });
    }
  },

  checkQueryStatus: async (queryId: string) => {
    try {
      const execution = await queryService.getQueryStatus(queryId);
      set({ execution, status: execution.status });

      // If query is completed, fetch results
      if (execution.status === 'completed') {
        get().fetchQueryResults(queryId);
      }

      // If query is still running, continue polling
      if (execution.status === 'running') {
        setTimeout(() => {
          get().checkQueryStatus(queryId);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking query status:', error);
      set({
        status: 'error',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check query status',
      });
    }
  },

  fetchQueryResults: async (queryId: string, page = 1, pageSize = 100) => {
    set({ loading: true, error: null });
    try {
      const results = await queryService.getQueryResults(
        queryId,
        page,
        pageSize
      );
      set({ results, loading: false });
    } catch (error) {
      console.error('Error fetching query results:', error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch query results',
      });
    }
  },

  downloadCsv: (queryId: string) => {
    queryService.downloadCsv(queryId);
  },

  reset: () => {
    set({
      execution: null,
      results: null,
      status: 'idle',
      loading: false,
      error: null,
    });
  },
}));
