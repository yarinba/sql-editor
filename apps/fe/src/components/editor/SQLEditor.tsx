import { useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

import { useSqlQuery } from '../../hooks/useSqlQuery';
import { useSchema } from '../../hooks/useSchema';
import EditorToolbar from './EditorToolbar';

const SQLEditor: React.FC = () => {
  const { sql, setSql, executeQuery } = useSqlQuery();
  const { tables } = useSchema();

  // Create a ref that always points to the current tables data
  const tablesRef = useRef(tables);

  // Keep the ref updated whenever tables changes
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  // Function to handle keyboard shortcuts
  const handleEditorKeyDown = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco
  ) => {
    editor.addCommand(
      // Monaco uses KeyMod.CtrlCmd which automatically uses Command on Mac and Control on Windows/Linux
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
      () => {
        executeQuery();
      }
    );
  };

  // Function to set up monaco editor with auto-completion
  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    // Add the keyboard shortcuts
    handleEditorKeyDown(editor, monacoInstance);

    // Register SQL auto-completion provider
    monacoInstance.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        context: monaco.languages.CompletionContext,
        token: monaco.CancellationToken
      ) => {
        // Get the current line text up to the current position
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Only provide table suggestions if appropriate
        const tableKeywords = ['FROM', 'JOIN'];
        const shouldSuggestTables = tableKeywords.some((keyword) => {
          const regex = new RegExp(`\\b${keyword}\\b\\s+$`, 'i');
          return regex.test(textUntilPosition);
        });

        if (!shouldSuggestTables) {
          return { suggestions: [] };
        }

        // Create suggestions from table names (using current value from ref)
        const suggestions = tablesRef.current.map((table) => {
          // Create a completion item with all required properties
          return {
            label: table.name,
            // kind is the icon of the completion item, can be overridden using css
            kind: monacoInstance.languages.CompletionItemKind.Class,
            detail: 'Table',
            insertText: table.name,
            // Use a default range - Monaco will adjust this as needed
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          };
        });

        return { suggestions };
      },
      // Add trigger characters to make auto-complete more responsive
      triggerCharacters: [' ', '.', '\n'],
    });
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
          onMount={handleEditorDidMount}
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
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
          }}
          theme="vs"
        />
      </div>
    </div>
  );
};

export default SQLEditor;
