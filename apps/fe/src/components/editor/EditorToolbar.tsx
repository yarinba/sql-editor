import { Play, Save, WandSparkles, Settings, Loader } from 'lucide-react';
import { useSqlQuery } from '../../hooks/useSqlQuery';

const EditorToolbar: React.FC = () => {
  const { loading, executeQuery } = useSqlQuery();

  return (
    <div className="flex items-center p-1 bg-gray-100 border-b border-gray-200">
      <div className="flex items-center gap-1">
        <button
          onClick={() => executeQuery()}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
        >
          {loading ? (
            <Loader size={12} className="animate-spin" />
          ) : (
            <Play size={12} />
          )}
          <span className="text-xs font-medium">Run</span>
        </button>

        <div className="w-px h-3 bg-gray-300 mx-0.5"></div>

        <button
          title="Save"
          className="p-1 text-gray-600 hover:text-gray-900 rounded focus:outline-none"
        >
          <Save size={14} />
        </button>

        <button
          title="Format"
          className="p-1 text-gray-600 hover:text-gray-900 rounded focus:outline-none"
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
