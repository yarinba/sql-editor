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
  fetchQueryResults: (
    queryId: string,
    page?: number,
    pageSize?: number
  ) => Promise<void>;
  downloadCsv: (queryId: string) => void;
  reset: () => void;
}

// Helper function to poll query status until it's no longer running
const pollRunningQuery = async (
  queryId: string,
  pollInterval = 1000
): Promise<QueryExecution> => {
  const query = await queryService.getQueryStatus(queryId);

  if (query.status !== 'running') {
    return query;
  }

  await new Promise((resolve) => setTimeout(resolve, pollInterval));
  return pollRunningQuery(queryId, pollInterval);
};

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

      const runningExecution = await queryService.executeQuery(request);
      set({ execution: runningExecution, status: runningExecution.status });

      const finishedExecution = await pollRunningQuery(
        runningExecution.queryId
      );
      set({ execution: finishedExecution, status: finishedExecution.status });

      // If query is completed, set the results
      if (finishedExecution.status === 'completed') {
        // loading will state will be handled in fetchQueryResults
        get().fetchQueryResults(finishedExecution.queryId);
      }
      if (finishedExecution.status === 'error') {
        // error will be handled in catch block
        throw new Error(finishedExecution.error?.message);
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
