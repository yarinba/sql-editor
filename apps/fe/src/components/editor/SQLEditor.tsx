import Editor from '@monaco-editor/react';

import { useSqlQuery } from '../../hooks/useSqlQuery';
import EditorToolbar from './EditorToolbar';

const SQLEditor: React.FC = () => {
  const { sql, setSql, executeQuery } = useSqlQuery();

  // Function to handle keyboard shortcuts
  const handleEditorKeyDown = (editor: any, monaco: any) => {
    editor.addCommand(
      // Monaco uses KeyMod.CtrlCmd which automatically uses Command on Mac and Control on Windows/Linux
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => {
        executeQuery();
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <EditorToolbar />

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={sql}
          onChange={(value) => setSql(value)}
          onMount={handleEditorKeyDown}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
            lineNumbers: 'on',
            renderLineHighlight: 'none',
            fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
            fontLigatures: true,
            folding: true,
            matchBrackets: 'always',
            autoIndent: 'full',
            colorDecorators: true,
          }}
          theme="vs"
        />
      </div>
    </div>
  );
};

export default SQLEditor;
