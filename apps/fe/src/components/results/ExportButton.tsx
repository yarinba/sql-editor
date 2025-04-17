import * as React from 'react';

interface ExportButtonProps {
  queryId: string | undefined;
}

const ExportButton: React.FC<ExportButtonProps> = ({ queryId }) => {
  if (!queryId) return null;

  return (
    <button
      onClick={() =>
        window.open(`/api/query/${queryId}/download/csv`, '_blank')
      }
      className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-sm font-medium"
    >
      Export CSV
    </button>
  );
};

export default ExportButton;
