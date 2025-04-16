import * as React from 'react';
import Editor from '@monaco-editor/react';
import { useQuery } from '../../hooks/useQuery';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
}

const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  onExecute,
  isExecuting,
}) => {
  const { setSql, executeQuery } = useQuery();

  // Set the value in the query store when it changes
  React.useEffect(() => {
    setSql(value);
  }, [value, setSql]);

  const handleExecute = React.useCallback(() => {
    onExecute();
    executeQuery();
  }, [onExecute, executeQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">SQL Editor</h2>
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className={`
            px-4 py-2 rounded font-medium text-white
            ${
              isExecuting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }
            transition-colors duration-150
          `}
        >
          {isExecuting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Executing...
            </span>
          ) : (
            'Execute Query'
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={value}
          onChange={(value) => onChange(value || '')}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
          }}
          theme="vs-dark"
        />
      </div>
    </div>
  );
};

export default SQLEditor;
