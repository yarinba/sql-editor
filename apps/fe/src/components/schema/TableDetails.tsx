import * as React from 'react';
import { Column, TableDetails as TableDetailsType } from '@sql-editor/types';

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
      <div className="pl-6 py-2">
        <div className="animate-pulse h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="animate-pulse h-4 bg-slate-200 rounded w-1/2 mt-1"></div>
      </div>
    );
  }

  if (!tableDetails) {
    return null;
  }

  return (
    <ul className="pl-6 mt-1 space-y-1">
      {tableDetails.columns.map((column: Column) => (
        <li key={column.name} className="flex items-center p-1 text-sm">
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
  );
};

export default TableDetails;
