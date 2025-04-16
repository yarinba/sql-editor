import { useQueryStore } from '../store/query';

/**
 * Custom hook for SQL query execution and results
 */
export function useQuery() {
  const {
    sql,
    execution,
    results,
    status,
    loading,
    error,
    setSql,
    executeQuery,
    checkQueryStatus,
    fetchQueryResults,
    downloadCsv,
    reset,
  } = useQueryStore();

  return {
    // State
    sql,
    execution,
    results,
    status,
    loading,
    error,

    // Query execution
    executeQuery,

    // Query management
    setSql,
    checkQueryStatus,
    fetchQueryResults,
    downloadCsv,
    reset,

    // Computed properties
    isExecuting: status === 'running',
    hasError: status === 'error',
    hasResults: status === 'completed' && results !== null,
  };
}
