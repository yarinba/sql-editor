import * as React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { QueryColumn, QueryResults } from '@sql-editor/types';
import Pagination from './Pagination';

interface ResultsTableProps {
  results: QueryResults;
  setPage: (page: number) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, setPage }) => {
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
                <div>{col.name}</div>
                <div className="text-xs text-gray-500 uppercase">
                  {col.type}
                </div>
              </div>
            ),
            cell: (info) => {
              const value = info.getValue();
              // Format cell value based on type
              if (value === null)
                return <span className="text-gray-400">NULL</span>;
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

  return (
    <>
      <div className="flex-1 overflow-auto px-4">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-3 px-2 text-left font-medium border-b border-gray-200 text-gray-700"
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
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-2 text-gray-600">
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
    </>
  );
};

export default ResultsTable;
