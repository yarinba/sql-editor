import * as React from 'react';
import { BarChart2, Download } from 'lucide-react';
import { useSqlQuery } from '../../hooks/useSqlQuery';

const ResultsToolbar: React.FC = () => {
  const { results } = useSqlQuery();

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 py-1 px-2">
      <span className="bg-white font-medium shadow-sm border border-gray-200 px-3 py-1 rounded-md text-sm">
        Results
        {results?.rowCount && (
          <span className="ml-1 text-xs text-gray-500">
            ({results.rowCount.toLocaleString()})
          </span>
        )}
      </span>

      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1 px-2 py-1 bg-white text-gray-700 rounded hover:bg-gray-100 border border-gray-300 transition text-xs">
          <BarChart2 size={14} />
          <span>Create Chart</span>
        </button>

        <button className="p-1 text-gray-600 hover:text-gray-800 bg-white rounded border border-gray-300 hover:bg-gray-100 transition">
          <Download size={14} />
        </button>
      </div>
    </div>
  );
};

export default ResultsToolbar;
