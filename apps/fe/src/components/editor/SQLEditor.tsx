import * as React from 'react';
import Editor from '@monaco-editor/react';
import { useSqlQuery } from '../../hooks/useSqlQuery';
import EditorToolbar from './EditorToolbar';

const SQLEditor: React.FC = () => {
  const { sql, setSql } = useSqlQuery();

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar />

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={sql}
          onChange={(value) => setSql(value)}
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
