import { Play, Save, Settings, WandSparkles } from 'lucide-react';

import { useSqlQuery } from '../../hooks/useSqlQuery';

const EditorToolbar: React.FC = () => {
  const { loading, executeQuery } = useSqlQuery();

  return (
    <div className="border-b border-t border-slate-200 bg-slate-800 flex items-center p-1 gap-1">
      {/* Execute Query (Green) */}
      <button
        onClick={() => executeQuery()}
        disabled={loading}
        className="p-1 text-green-500 hover:bg-slate-700 rounded-md transition focus:outline-none"
        title="Run"
      >
        <Play size={16} />
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-slate-600"></div>

      {/* Save */}
      <button
        className="p-1 text-slate-300 hover:bg-slate-700 rounded-md transition focus:outline-none"
        title="Save"
      >
        <Save size={16} />
      </button>

      {/* Format */}
      <button
        className="p-1 text-slate-300 hover:bg-slate-700 rounded-md transition focus:outline-none"
        title="Format"
      >
        <WandSparkles size={16} />
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-slate-600"></div>

      {/* Settings */}
      <button
        className="p-1 text-slate-300 hover:bg-slate-700 rounded-md transition focus:outline-none"
        title="Settings"
      >
        <Settings size={16} />
      </button>
    </div>
  );
};

export default EditorToolbar;
