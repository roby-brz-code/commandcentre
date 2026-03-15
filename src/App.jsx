import { useState } from 'react';
import Layout from './components/layout/Layout';
import ProcessManualPage from './pages/ProcessManualPage';
import DashboardPage from './pages/DashboardPage';
import QueryPage from './pages/QueryPage';
import ReconPage from './pages/ReconPage';

const pages = {
  manual: ProcessManualPage,
  dashboard: DashboardPage,
  query: QueryPage,
  recon: ReconPage,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('manual');
  const Page = pages[activeTab] || ProcessManualPage;

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <Page />
    </Layout>
  );
}
