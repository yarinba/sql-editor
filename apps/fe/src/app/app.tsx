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
                <SQLEditor />
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>

          {/* Bottom section: Results Table */}
          <Allotment.Pane minSize={150}>
            <ResultsSection />
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}

export default App;
