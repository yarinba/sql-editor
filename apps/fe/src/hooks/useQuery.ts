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

  // Create a setPage function for pagination
  const setPage = (page: number) => {
    if (execution?.queryId) {
      fetchQueryResults(execution.queryId, page);
    }
  };

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

    // Pagination
    setPage,

    // Computed properties
    isExecuting: status === 'running',
    hasError: status === 'error',
    hasResults: status === 'completed' && results !== null,
  };
}
