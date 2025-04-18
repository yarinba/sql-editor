import { useMemo } from 'react';
import { Play, Save, WandSparkles, Settings, Loader } from 'lucide-react';
import { useSqlQuery } from '../../hooks/useSqlQuery';
import { format } from '@sqltools/formatter';

const EditorToolbar: React.FC = () => {
  const { loading, sql, setSql, executeQuery } = useSqlQuery();

  // Determine the run query keyboard shortcut text based on platform
  const runShortcutText = useMemo(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return isMac ? '⌘ + ⏎' : 'Ctrl + ⏎';
  }, []);

  // Format the SQL query using the formatter library
  const formatQuery = () => {
    if (!sql) return;

    try {
      const formattedSql = format(sql, {
        language: 'sql',
        indent: '  ', // Two spaces
        linesBetweenQueries: 2,
      });

      setSql(formattedSql);
    } catch (error) {
      console.error('Error formatting SQL:', error);
    }
  };

  return (
    <div className="flex items-center p-1 bg-gray-100 border-b border-gray-200">
      <div className="flex items-center gap-1">
        <button
          onClick={() => executeQuery()}
          disabled={loading}
          title={`Run query (${runShortcutText})`}
          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
        >
          {loading ? (
            <Loader size={12} className="animate-spin" />
          ) : (
            <Play size={12} />
          )}
          <span className="text-xs font-medium">Run</span>
          <kbd className="hidden sm:inline-flex ml-1 text-[10px] px-1 py-0 bg-blue-700 rounded">
            {runShortcutText}
          </kbd>
        </button>

        <div className="w-px h-3 bg-gray-300 mx-0.5"></div>

        <button
          title="Save"
          className="p-1 text-gray-600 hover:text-gray-900 rounded focus:outline-none"
        >
          <Save size={14} />
        </button>

        <button
          onClick={formatQuery}
          title="Format SQL"
          className="p-1 text-gray-600 hover:text-gray-900 rounded focus:outline-none active:text-blue-600 transition-colors"
        >
          <WandSparkles size={14} />
        </button>

        <div className="w-px h-3 bg-gray-300 mx-0.5"></div>

        <button
          title="Settings"
          className="p-1 text-gray-600 hover:text-gray-900 rounded focus:outline-none"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
