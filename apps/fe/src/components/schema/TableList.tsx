import * as React from 'react';
import { Table } from '@sql-editor/types';

interface TableListProps {
  tables: Table[];
  selectedTable: string | null;
  expandedTables: Record<string, boolean>;
  onToggleTable: (tableName: string) => void;
  loading: boolean;
  error: string | null;
}

const TableList: React.FC<TableListProps> = ({
  tables,
  selectedTable,
  expandedTables,
  onToggleTable,
  loading,
  error,
}) => {
  if (loading && tables.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (error && tables.length === 0) {
    return (
      <div className="text-red-500 p-2">Error loading schema: {error}</div>
    );
  }

  if (tables.length === 0) {
    return <div className="text-slate-500 p-2">No tables found</div>;
  }

  return (
    <ul className="space-y-1">
      {tables.map((table: Table) => (
        <li key={table.name} className="select-none">
          <div
            className={`
              flex items-center p-2 rounded cursor-pointer
              ${
                selectedTable === table.name
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-slate-100'
              }
            `}
            onClick={() => onToggleTable(table.name)}
          >
            <span className="mr-1">
              {expandedTables[table.name] ? '▼' : '▶'}
            </span>
            <span className="font-medium">{table.name}</span>
            {table.rowCount && (
              <span className="ml-2 text-xs text-slate-500">
                ({table.rowCount.toLocaleString()} rows)
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TableList;
