import * as React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { useSqlQuery } from '../../hooks/useSqlQuery';
import { QueryColumn } from '@sql-editor/types';
import Pagination from './Pagination';
import ExportButton from './ExportButton';

const ResultsTable: React.FC = () => {
  const { results, execution, loading, error, status, setPage } = useSqlQuery();
  const [columns, setColumns] = React.useState<ColumnDef<any, any>[]>([]);

  // Generate table columns when results change
  React.useEffect(() => {
    if (results?.columns && results.columns.length > 0) {
      const columnHelper = createColumnHelper<any>();

      // Create a column definition for each column in the results
      const tableColumns = results.columns.map(
        (col: QueryColumn, colIndex: number) => {
          return columnHelper.accessor((row) => row[colIndex], {
            id: col.name,
            header: () => (
              <div className="font-medium text-left">
                {col.name}
                <div className="text-xs text-slate-500">{col.type}</div>
              </div>
            ),
            cell: (info) => {
              const value = info.getValue();
              // Format cell value based on type
              if (value === null)
                return <span className="text-slate-400">NULL</span>;
              if (typeof value === 'object') return JSON.stringify(value);
              return String(value);
            },
          });
        }
      );

      setColumns(tableColumns);
    }
  }, [results]);

  // Create table instance
  const table = useReactTable({
    data: results?.rows || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Results</h2>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mx-auto mb-4"></div>
            <p className="text-slate-600">Executing query...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || status === 'error') {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Results</h2>
        </div>
        <div className="flex-1 p-4">
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            <h3 className="font-medium mb-2">Error executing query</h3>
            <p className="font-mono text-sm whitespace-pre-wrap">
              {error || execution?.error?.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty/not executed state
  if (!results || results.rows.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Results</h2>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {results ? (
            <p className="text-slate-500">No results returned</p>
          ) : (
            <p className="text-slate-500">Execute a query to see results</p>
          )}
        </div>
      </div>
    );
  }

  // Handle results
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Results</h2>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600">
            {results.rowCount.toLocaleString()} row
            {results.rowCount !== 1 ? 's' : ''}
            {results.truncated && ' (truncated)'}
          </div>

          <ExportButton queryId={execution?.queryId} />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 text-left font-medium border-r border-slate-200 last:border-r-0"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-200 hover:bg-slate-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="p-2 border-r border-slate-200 last:border-r-0 font-mono text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {results.pageCount && results.pageCount > 1 && (
        <Pagination
          currentPage={results.currentPage}
          pageCount={results.pageCount}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default ResultsTable;
