import { Allotment } from 'allotment';
import Header from '../components/layout/Header';
import SchemaExplorer from '../components/schema/SchemaExplorer';
import SQLEditor from '../components/editor/SQLEditor';
import ResultsSection from '../components/results/ResultsSection';

export function App() {
  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex-1 overflow-hidden">
        <Allotment>
          {/* Left section: Schema Explorer (full height) */}
          <Allotment.Pane preferredSize={250} minSize={200}>
            <SchemaExplorer />
          </Allotment.Pane>

          {/* Right section: SQL Editor and Results Table */}
          <Allotment.Pane minSize={400}>
            <Allotment vertical defaultSizes={[60, 40]}>
              {/* SQL Editor */}
              <Allotment.Pane minSize={150}>
                <SQLEditor />
              </Allotment.Pane>

              {/* Results Table */}
              <Allotment.Pane minSize={150}>
                <ResultsSection />
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}

export default App;
