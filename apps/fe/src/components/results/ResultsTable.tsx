import * as React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { useQuery } from '../../hooks/useQuery';
import { QueryColumn } from '@sql-editor/types';

interface ResultsTableProps {
  isLoading: boolean;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ isLoading }) => {
  const { results, execution, error, status, setPage } = useQuery();
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
  if (isLoading) {
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

          {execution?.queryId && (
            <button
              onClick={() =>
                window.open(
                  `/api/query/${execution.queryId}/download/csv`,
                  '_blank'
                )
              }
              className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-sm font-medium"
            >
              Export CSV
            </button>
          )}
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
        <div className="border-t border-slate-200 p-2 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            Page {results.currentPage} of {results.pageCount}
          </div>
          <div className="flex gap-1">
            {/* Pagination buttons */}
            <button
              onClick={() => setPage(1)}
              disabled={results.currentPage === 1}
              className={`px-2 py-1 rounded text-sm ${
                results.currentPage === 1
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              aria-label="First page"
            >
              &laquo;
            </button>
            <button
              onClick={() => setPage(Math.max(1, results.currentPage - 1))}
              disabled={results.currentPage === 1}
              className={`px-2 py-1 rounded text-sm ${
                results.currentPage === 1
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              aria-label="Previous page"
            >
              &lsaquo;
            </button>

            {/* Generate page number buttons */}
            {generatePaginationButtons(
              results.currentPage,
              results.pageCount
            ).map((page) => (
              <button
                key={`page-${page}`}
                onClick={() => page !== '...' && setPage(Number(page))}
                className={`px-2 py-1 rounded text-sm ${
                  page === '...'
                    ? 'bg-slate-100 text-slate-500 cursor-default'
                    : page === results.currentPage.toString()
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
                disabled={page === '...'}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setPage(Math.min(results.pageCount, results.currentPage + 1))
              }
              disabled={results.currentPage === results.pageCount}
              className={`px-2 py-1 rounded text-sm ${
                results.currentPage === results.pageCount
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              aria-label="Next page"
            >
              &rsaquo;
            </button>
            <button
              onClick={() => setPage(results.pageCount)}
              disabled={results.currentPage === results.pageCount}
              className={`px-2 py-1 rounded text-sm ${
                results.currentPage === results.pageCount
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              aria-label="Last page"
            >
              &raquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate pagination buttons with ellipsis for large page counts
const generatePaginationButtons = (currentPage: number, totalPages: number) => {
  // Show at most 7 page buttons at a time (including ellipsis)
  if (totalPages <= 7) {
    // If there are 7 or fewer pages, show all page numbers
    return Array.from({ length: totalPages }, (_, i) => String(i + 1));
  }

  // Initialize the array of buttons to show
  const pageButtons: string[] = [];

  // Always show first page
  pageButtons.push('1');

  // Logic for adding middle pages
  if (currentPage <= 3) {
    // If current page is near the start
    pageButtons.push('2', '3', '4', '5', '...', String(totalPages));
  } else if (currentPage >= totalPages - 2) {
    // If current page is near the end
    pageButtons.push(
      '...',
      String(totalPages - 4),
      String(totalPages - 3),
      String(totalPages - 2),
      String(totalPages - 1),
      String(totalPages)
    );
  } else {
    // If current page is in the middle
    pageButtons.push(
      '...',
      String(currentPage - 1),
      String(currentPage),
      String(currentPage + 1),
      '...',
      String(totalPages)
    );
  }

  return pageButtons;
};

export default ResultsTable;
