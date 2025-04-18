import { useEffect } from 'react';
import { useSchemaStore } from '../store/schema';

/**
 * Custom hook for accessing and managing database schema
 */
export function useSchema() {
  const {
    tables,
    expandedTables,
    tableDetailsMap,
    loadingTables,
    loadingDetailsMap,
    error,
    fetchTables,
    fetchTableDetails,
    toggleTableExpansion,
  } = useSchemaStore();

  // Load tables when hook is first used
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    // State
    tables,
    expandedTables,
    tableDetailsMap,
    loadingTables,
    loadingDetailsMap,
    error,

    // Actions
    fetchTables,
    fetchTableDetails,
    toggleTableExpansion,
  };
}
