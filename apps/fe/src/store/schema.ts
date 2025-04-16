import { create } from 'zustand';
import { Table, TableDetails } from '@sql-editor/types';
import { schemaService } from '../services/api';

interface SchemaState {
  tables: Table[];
  selectedTable: string | null;
  tableDetails: TableDetails | null;
  loading: boolean;
  error: string | null;
  fetchTables: () => Promise<void>;
  fetchTableDetails: (tableName: string) => Promise<void>;
  selectTable: (tableName: string) => void;
}

export const useSchemaStore = create<SchemaState>((set, get) => ({
  tables: [],
  selectedTable: null,
  tableDetails: null,
  loading: false,
  error: null,

  fetchTables: async () => {
    set({ loading: true, error: null });
    try {
      const tables = await schemaService.getTables();
      set({ tables, loading: false });
    } catch (error) {
      console.error('Error fetching tables:', error);
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch tables',
      });
    }
  },

  fetchTableDetails: async (tableName: string) => {
    set({ loading: true, error: null });
    try {
      const tableDetails = await schemaService.getTableDetails(tableName);
      set({ tableDetails, loading: false });
    } catch (error) {
      console.error(`Error fetching table details for ${tableName}:`, error);
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : `Failed to fetch details for ${tableName}`,
      });
    }
  },

  selectTable: (tableName: string) => {
    set({ selectedTable: tableName });
    get().fetchTableDetails(tableName);
  },
}));
