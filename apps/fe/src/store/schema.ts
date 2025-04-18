import { create } from 'zustand';
import { Table, TableDetails } from '@sql-editor/types';
import { schemaService } from '../services/api';

interface SchemaState {
  tables: Table[];
  expandedTables: Set<string>;
  tableDetailsMap: Record<string, TableDetails | null>;
  loadingTables: boolean;
  loadingDetailsMap: Record<string, boolean>;
  error: string | null;
  fetchTables: () => Promise<void>;
  fetchTableDetails: (tableName: string) => Promise<void>;
  toggleTableExpansion: (tableName: string) => void;
}

export const useSchemaStore = create<SchemaState>((set, get) => ({
  tables: [],
  expandedTables: new Set<string>(),
  tableDetailsMap: {},
  loadingTables: false,
  loadingDetailsMap: {},
  error: null,

  fetchTables: async () => {
    set({ loadingTables: true, error: null });
    try {
      const tables = await schemaService.getTables();
      set({ tables, loadingTables: false });
    } catch (error) {
      console.error('Error fetching tables:', error);
      set({
        loadingTables: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch tables',
      });
    }
  },

  fetchTableDetails: async (tableName: string) => {
    // Set loading state for this specific table
    set((state) => ({
      loadingDetailsMap: {
        ...state.loadingDetailsMap,
        [tableName]: true,
      },
    }));

    try {
      const tableDetails = await schemaService.getTableDetails(tableName);
      set((state) => ({
        tableDetailsMap: {
          ...state.tableDetailsMap,
          [tableName]: tableDetails,
        },
        loadingDetailsMap: {
          ...state.loadingDetailsMap,
          [tableName]: false,
        },
      }));
    } catch (error) {
      console.error(`Error fetching table details for ${tableName}:`, error);
      set((state) => ({
        loadingDetailsMap: {
          ...state.loadingDetailsMap,
          [tableName]: false,
        },
        error:
          error instanceof Error
            ? error.message
            : `Failed to fetch details for ${tableName}`,
      }));
    }
  },

  toggleTableExpansion: (tableName: string) => {
    // Update expanded tables set
    set((state) => {
      const newExpandedTables = new Set(state.expandedTables);

      if (newExpandedTables.has(tableName)) {
        newExpandedTables.delete(tableName);
      } else {
        newExpandedTables.add(tableName);
        // Fetch details if this is the first time expanding or if we don't have details yet
        if (!state.tableDetailsMap[tableName]) {
          get().fetchTableDetails(tableName);
        }
      }

      return { expandedTables: newExpandedTables };
    });
  },
}));
