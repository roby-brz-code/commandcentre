import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import ProcessManualPage from './pages/ProcessManualPage';
import MonthlyClosePage from './pages/MonthlyClosePage';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [dataMode, setDataMode] = useState(() => {
    return localStorage.getItem('luca-data-mode') || 'demo';
  });

  useEffect(() => {
    localStorage.setItem('luca-data-mode', dataMode);
  }, [dataMode]);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} dataMode={dataMode} onDataModeChange={setDataMode}>
      {activeTab === 'close' ? (
        <MonthlyClosePage />
      ) : (
        <ProcessManualPage dataMode={dataMode} />
      )}
    </Layout>
  );
}
