import { useState } from 'react';
import Layout from './components/layout/Layout';
import ProcessManualPage from './pages/ProcessManualPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [mode, setMode] = useState('demo');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} mode={mode} onModeChange={setMode}>
      <ProcessManualPage mode={mode} />
    </Layout>
  );
}
