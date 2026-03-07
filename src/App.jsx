import { useState } from 'react';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import QueryPage from './pages/QueryPage';
import ReconPage from './pages/ReconPage';

const pages = {
  dashboard: DashboardPage,
  query: QueryPage,
  recon: ReconPage,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const Page = pages[activeTab];

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <Page />
    </Layout>
  );
}
