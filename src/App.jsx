import { useState } from 'react';
import Layout from './components/layout/Layout';
import ProcessManualPage from './pages/ProcessManualPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [dataMode, setDataMode] = useState(() => {
    try { return localStorage.getItem('luca-data-mode') || 'demo'; }
    catch { return 'demo'; }
  });

  function handleModeChange(mode) {
    setDataMode(mode);
    try { localStorage.setItem('luca-data-mode', mode); }
    catch { /* localStorage unavailable */ }
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} dataMode={dataMode} onModeChange={handleModeChange}>
      <ProcessManualPage dataMode={dataMode} />
    </Layout>
  );
}
