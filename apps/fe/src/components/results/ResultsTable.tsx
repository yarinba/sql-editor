import * as React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  ColumnResizeMode,
} from '@tanstack/react-table';
import { QueryColumn, QueryResults } from '@sql-editor/types';
import Pagination from './Pagination';

interface ResultsTableProps {
  results: QueryResults;
  setPage: (page: number) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, setPage }) => {
  const [columns, setColumns] = React.useState<ColumnDef<any, any>[]>([]);
  const [columnResizeMode] = React.useState<ColumnResizeMode>('onChange');
  const [columnSizing, setColumnSizing] = React.useState({});

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
              <div className="text-left whitespace-nowrap">
                <div className="font-medium">{col.name}</div>
                <div className="text-xs text-gray-400 uppercase">
                  {col.type}
                </div>
              </div>
            ),
            cell: (info) => {
              const value = info.getValue();
              // Format cell value based on type
              if (value === null)
                return <span className="text-gray-400 italic">null</span>;
              if (typeof value === 'object')
                return (
                  <span className="font-mono text-xs whitespace-nowrap inline-block">
                    {JSON.stringify(value)}
                  </span>
                );
              return (
                <span className="font-mono text-sm whitespace-nowrap">
                  {String(value)}
                </span>
              );
            },
            size: 200, // Default column width
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
    columnResizeMode,
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="flex-1 overflow-auto px-2">
        <table
          className="w-full border-collapse text-sm"
          style={{ width: table.getCenterTotalSize() }}
        >
          <thead className="sticky top-0 z-10 after:absolute after:content-[''] after:left-0 after:right-0 after:bottom-0 after:h-px after:bg-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-2 px-3 text-left bg-white/95 backdrop-blur-sm relative"
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {/* Add resizer div */}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`absolute top-0 right-0 h-full w-1 cursor-col-resize select-none hover:bg-blue-500 ${
                        header.column.getIsResizing() ? 'bg-blue-500' : ''
                      }`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-4 text-center text-gray-500 italic"
                >
                  No results
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-2 px-3 text-gray-700"
                      style={{
                        maxWidth: cell.column.getSize(),
                      }}
                    >
                      <div className="overflow-x-hidden text-ellipsis whitespace-nowrap max-h-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
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
