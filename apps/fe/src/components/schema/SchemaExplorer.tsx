import * as React from 'react';
import { useSchema } from '../../hooks/useSchema';
import TableList from './TableList';
import TableDetails from './TableDetails';

const SchemaExplorer: React.FC = () => {
  const { tables, selectedTable, tableDetails, loading, error, selectTable } =
    useSchema();
  const [expandedTables, setExpandedTables] = React.useState<
    Record<string, boolean>
  >({});

  // Toggle expanded state for a table
  const handleToggleTable = (tableName: string) => {
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
        <TableList
          tables={tables}
          selectedTable={selectedTable}
          expandedTables={expandedTables}
          onToggleTable={handleToggleTable}
          loading={loading}
          error={error}
        />

        {/* Show table details for expanded tables */}
        {Object.entries(expandedTables).map(([tableName, isExpanded]) => {
          if (!isExpanded) return null;

          const isLoadingDetails =
            loading && (!tableDetails || tableDetails.name !== tableName);

          const showDetails = tableDetails && tableDetails.name === tableName;

          return (
            <div key={tableName}>
              {showDetails && (
                <TableDetails tableDetails={tableDetails} loading={false} />
              )}

              {isLoadingDetails && (
                <TableDetails tableDetails={null} loading={true} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SchemaExplorer;
