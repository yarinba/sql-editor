import * as React from 'react';
import { Search, Database, ChevronRight, ChevronDown, X } from 'lucide-react';
import { useSchema } from '../../hooks/useSchema';
import { Table } from '@sql-editor/types';
import TableDetails from './TableDetails';

const SchemaExplorer: React.FC = () => {
  const {
    tables,
    expandedTables,
    tableDetailsMap,
    loadingTables,
    loadingDetailsMap,
    error,
    toggleTableExpansion,
  } = useSchema();

  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter tables based on search query
  const filteredTables = React.useMemo(() => {
    if (!searchQuery.trim()) return tables;

    return tables.filter((table) =>
      table.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tables, searchQuery]);

  // Render loading state
  if (loadingTables && tables.length === 0) {
    return (
      <div className="flex flex-col h-full bg-slate-50/50">
        <div className="px-3 py-2 border-b border-slate-200 bg-white">
          <h2 className="text-sm font-medium text-slate-800">Schema</h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-800"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && tables.length === 0) {
    return (
      <div className="flex flex-col h-full bg-slate-50/50">
        <div className="px-3 py-2 border-b border-slate-200 bg-white">
          <h2 className="text-sm font-medium text-slate-800">Schema</h2>
        </div>
        <div className="p-3 text-xs text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="px-3 py-2 border-b border-slate-200 bg-white flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-800">Schema</h2>
        <div className="text-xs text-slate-500">{tables.length} tables</div>
      </div>

      {/* Search box */}
      <div className="px-3 py-2 border-b border-slate-200">
        <div className="relative">
          <input
            type="text"
            className="w-full px-2 py-1.5 pl-7 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400" />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Tree View */}
      <div className="overflow-auto flex-1 text-sm">
        {filteredTables.length === 0 ? (
          <div className="p-3 text-center text-xs text-slate-500">
            No tables found{searchQuery ? ` matching "${searchQuery}"` : ''}
          </div>
        ) : (
          <div className="py-1">
            {filteredTables.map((table: Table) => {
              const isExpanded = expandedTables.has(table.name);
              const isLoading = loadingDetailsMap[table.name];
              const tableDetails = tableDetailsMap[table.name];

              return (
                <div key={table.name} className="select-none">
                  {/* Table header */}
                  <button
                    onClick={() => toggleTableExpansion(table.name)}
                    className="flex items-center w-full px-3 py-1 text-left hover:bg-slate-100 focus:outline-none focus:bg-slate-100 text-xs font-mono"
                  >
                    <span className="mr-1 opacity-70">
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </span>
                    <span className="flex items-center">
                      <Database className="h-3 w-3 mr-2 text-blue-500/70" />
                    </span>
                    <span className="font-medium">{table.name}</span>
                    {table.rowCount && (
                      <span className="whitespace-nowrap ml-2 text-xxs opacity-50 tabular-nums">
                        {table.rowCount.toLocaleString()} rows
                      </span>
                    )}
                  </button>

                  {/* Table details */}
                  {isExpanded && (
                    <div className="bg-white border-y border-slate-100">
                      <TableDetails
                        tableDetails={tableDetails}
                        loading={isLoading || false}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-3 py-1 border-t border-slate-200 bg-white text-xxs text-slate-500 flex justify-between items-center">
        <span>Database Schema</span>
        <span className="tabular-nums">
          {filteredTables.length} of {tables.length}
        </span>
      </div>
    </div>
  );
};

export default SchemaExplorer;
