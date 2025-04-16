import { useEffect } from 'react';
import { useSchemaStore } from '../store/schema';

/**
 * Custom hook for accessing and managing database schema
 */
export function useSchema() {
  const {
    tables,
    selectedTable,
    tableDetails,
    loading,
    error,
    fetchTables,
    fetchTableDetails,
    selectTable,
  } = useSchemaStore();

  // Load tables when hook is first used
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    // State
    tables,
    selectedTable,
    tableDetails,
    loading,
    error,

    // Actions
    fetchTables,
    fetchTableDetails,
    selectTable,
  };
}
