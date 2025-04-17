import * as React from 'react';
import { useSqlQuery } from '../../hooks/useSqlQuery';
import ResultsToolbar from './ResultsToolbar';
import ResultsTable from './ResultsTable';

const ResultsSection: React.FC = () => {
  const { results, execution, loading, error, status, setPage } = useSqlQuery();

  // Handle loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white text-gray-800">
        <ResultsToolbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Executing query...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || status === 'error') {
    return (
      <div className="flex flex-col h-full bg-white text-gray-800">
        <ResultsToolbar />
        <div className="flex-1 p-4">
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-600">
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
      <div className="flex flex-col h-full bg-white text-gray-800">
        <ResultsToolbar />
        <div className="flex-1 flex justify-center items-center">
          {results ? (
            <p className="text-gray-500">No results returned</p>
          ) : (
            <p className="text-gray-500">Execute a query to see results</p>
          )}
        </div>
      </div>
    );
  }

  // Handle results
  return (
    <div className="flex flex-col h-full overflow-hidden bg-white text-gray-800">
      <ResultsToolbar />

      <ResultsTable results={results} setPage={setPage} />
    </div>
  );
};

export default ResultsSection;
