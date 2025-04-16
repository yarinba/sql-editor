import * as React from 'react';
import { useSchema } from '../../hooks/useSchema';
import { Table, Column } from '@sql-editor/types';

const SchemaExplorer: React.FC = () => {
  const { tables, selectedTable, tableDetails, loading, error, selectTable } =
    useSchema();
  const [expandedTables, setExpandedTables] = React.useState<
    Record<string, boolean>
  >({});

  // Toggle expanded state for a table
  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));

    // Load table details when expanded
    if (!expandedTables[tableName]) {
      selectTable(tableName);
    }
  };

  if (loading && tables.length === 0) {
    return (
      <div className="flex flex-col h-full p-4 overflow-auto bg-slate-50">
        <h2 className="text-lg font-semibold mb-4">Schema Explorer</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
        </div>
      </div>
    );
  }

  if (error && tables.length === 0) {
    return (
      <div className="flex flex-col h-full p-4 overflow-auto bg-slate-50">
        <h2 className="text-lg font-semibold mb-4">Schema Explorer</h2>
        <div className="text-red-500 p-2">Error loading schema: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-slate-50">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold">Schema Explorer</h2>
      </div>

      <div className="p-2 flex-1 overflow-auto">
        {tables.length === 0 ? (
          <div className="text-slate-500 p-2">No tables found</div>
        ) : (
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
                  onClick={() => toggleTable(table.name)}
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

                {/* Columns */}
                {expandedTables[table.name] &&
                  tableDetails &&
                  tableDetails.name === table.name && (
                    <ul className="pl-6 mt-1 space-y-1">
                      {tableDetails.columns.map((column: Column) => (
                        <li
                          key={column.name}
                          className="flex items-center p-1 text-sm"
                        >
                          <span className="text-slate-400 mr-2">-</span>
                          <span className="font-mono">{column.name}</span>
                          <span className="ml-2 text-xs text-slate-500">
                            {column.type}
                            {column.isPrimary && ' (PK)'}
                            {column.nullable ? '' : ' (NOT NULL)'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                {/* Loading indicator for table details */}
                {expandedTables[table.name] &&
                  loading &&
                  (!tableDetails || tableDetails.name !== table.name) && (
                    <div className="pl-6 py-2">
                      <div className="animate-pulse h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="animate-pulse h-4 bg-slate-200 rounded w-1/2 mt-1"></div>
                    </div>
                  )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SchemaExplorer;
