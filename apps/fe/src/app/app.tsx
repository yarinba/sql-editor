import { Allotment } from 'allotment';
import { useState } from 'react';
import Header from '../components/layout/Header';
import SchemaExplorer from '../components/schema/SchemaExplorer';
import SQLEditor from '../components/editor/SQLEditor';
import ResultsTable from '../components/results/ResultsTable';

export function App() {
  const [query, setQuery] = useState<string>('SELECT * FROM users LIMIT 10;');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const handleExecuteQuery = () => {
    setIsExecuting(true);
    // This will be replaced with actual API call logic
    setTimeout(() => {
      setIsExecuting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex-1 overflow-hidden">
        <Allotment vertical defaultSizes={[60, 40]}>
          {/* Top section: Schema Explorer and SQL Editor */}
          <Allotment.Pane>
            <Allotment>
              {/* Schema Explorer */}
              <Allotment.Pane preferredSize={250} minSize={200}>
                <SchemaExplorer />
              </Allotment.Pane>

              {/* SQL Editor */}
              <Allotment.Pane minSize={400}>
                <SQLEditor
                  value={query}
                  onChange={setQuery}
                  onExecute={handleExecuteQuery}
                  isExecuting={isExecuting}
                />
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>

          {/* Bottom section: Results Table */}
          <Allotment.Pane minSize={150}>
            <ResultsTable isLoading={isExecuting} />
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}

export default App;
