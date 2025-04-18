import * as React from 'react';
import { Column, TableDetails as TableDetailsType } from '@sql-editor/types';
import { Key, Hash, Type } from 'lucide-react';

interface TableDetailsProps {
  tableDetails: TableDetailsType | null;
  loading: boolean;
}

const TableDetails: React.FC<TableDetailsProps> = ({
  tableDetails,
  loading,
}) => {
  if (loading) {
    return (
      <div className="py-1.5 px-3 space-y-1.5 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-1">
            <div className="h-2.5 w-2.5 bg-slate-200 rounded-full"></div>
            <div className="h-2.5 bg-slate-200 rounded w-24"></div>
            <div className="ml-auto h-2.5 bg-slate-200 rounded w-10"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!tableDetails) {
    return null;
  }

  // Group columns by primary key first, then by id columns, then the rest
  const columns = [...tableDetails.columns];
  columns.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;

    const aHasId = a.name.includes('id') || a.name.endsWith('_id');
    const bHasId = b.name.includes('id') || b.name.endsWith('_id');

    if (aHasId && !bHasId) return -1;
    if (!aHasId && bHasId) return 1;

    return a.name.localeCompare(b.name);
  });

  return (
    <div className="py-1.5 px-4 text-xs">
      <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 gap-y-1.5">
        {columns.map((column: Column) => {
          let iconColor = 'text-slate-400';
          let bgColor = '';
          let icon = <Type className="h-2.5 w-2.5" />;

          if (column.isPrimary) {
            iconColor = 'text-amber-500';
            bgColor = 'bg-amber-50/50';
            icon = <Key className="h-2.5 w-2.5" />;
          } else if (
            column.name.includes('id') ||
            column.name.endsWith('_id')
          ) {
            iconColor = 'text-blue-500';
            bgColor = 'bg-blue-50/50';
            icon = <Hash className="h-2.5 w-2.5" />;
          }

          return (
            <React.Fragment key={column.name}>
              {/* Icon */}
              <div className="flex items-center">
                <div
                  className={`${iconColor} flex items-center justify-center h-4 w-4 rounded-full ${bgColor}`}
                >
                  {icon}
                </div>
              </div>

              {/* Column name */}
              <div className="flex items-center font-mono text-xs group">
                <span className="truncate">{column.name}</span>

                {/* Badges - shown on hover or for important properties */}
                <div className="hidden group-hover:flex items-center ml-2 space-x-1">
                  {column.isPrimary && (
                    <span className="text-xxs px-1 py-0.5 rounded-sm bg-amber-50 text-amber-600 font-normal">
                      PK
                    </span>
                  )}
                  {column.nullable === false && !column.isPrimary && (
                    <span className="text-xxs px-1 py-0.5 rounded-sm bg-slate-100 text-slate-500 font-normal">
                      req
                    </span>
                  )}
                </div>
              </div>

              {/* Data type */}
              <div className="flex items-center justify-end">
                <div className="px-1.5 py-0.5 text-xxs rounded-sm font-mono text-slate-500 tabular-nums bg-slate-100/80">
                  {getFormattedType(column.type)}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Table info */}
      <div className="mt-3 pt-2 border-t border-slate-100 text-xxs text-slate-500 flex justify-between">
        <span>{tableDetails.columns.length} columns</span>
        <span>
          {tableDetails.columns.filter((c) => c.isPrimary).length > 0
            ? `${
                tableDetails.columns.filter((c) => c.isPrimary).length
              } primary key(s)`
            : 'No primary key'}
        </span>
      </div>
    </div>
  );
};

// Helper function to format type names nicely
function getFormattedType(type: string): string {
  // Simple type formatter to make display more consistent
  const lowerType = type.toLowerCase();

  if (lowerType.includes('varchar') || lowerType.includes('character varying'))
    return 'varchar';
  if (lowerType.includes('int')) return 'integer';
  if (lowerType.includes('bool')) return 'boolean';
  if (lowerType.includes('timestamp')) return 'timestamp';
  if (lowerType.includes('date')) return 'date';
  if (lowerType.includes('float') || lowerType.includes('double'))
    return 'float';
  if (lowerType.includes('text')) return 'text';

  // For other types, keep as is but truncate if too long
  return type.length > 12 ? type.substring(0, 10) + '...' : type;
}

export default TableDetails;
