import { useState } from 'react';
import Layout from './components/layout/Layout';
import ProcessManualPage from './pages/ProcessManualPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <ProcessManualPage />
    </Layout>
  );
}
