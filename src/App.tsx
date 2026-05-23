import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddRun } from './pages/AddRun';
import { RunHistory } from './pages/RunHistory';
import { RunDetails } from './pages/RunDetails';
import { RecapBuilderPage } from './pages/RecapBuilderPage';
import { PersonalRecords } from './pages/PersonalRecords';
import { TrainingPlans } from './pages/TrainingPlans';
import { StatsDashboard } from './pages/StatsDashboard';
import { ZoneSettings } from './pages/ZoneSettings';
import { FutureCoaching } from './pages/FutureCoaching';
import { LiveRun } from './pages/LiveRun';
import { ShoeTracker } from './pages/ShoeTracker';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="live-run" element={<LiveRun />} />
          <Route path="add-run" element={<AddRun />} />
          <Route path="history" element={<RunHistory />} />
          <Route path="run/:id" element={<RunDetails />} />
          <Route path="records" element={<PersonalRecords />} />
          <Route path="training" element={<TrainingPlans />} />
          <Route path="stats" element={<StatsDashboard />} />
          <Route path="gear" element={<ShoeTracker />} />
          <Route path="settings" element={<ZoneSettings />} />
          <Route path="future" element={<FutureCoaching />} />
        </Route>
        <Route path="runs/:id/recap-builder" element={<RecapBuilderPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
