import { useState, useEffect, useCallback } from 'react';
import Layout from './components/layout/Layout';
import ProcessManualPage from './pages/ProcessManualPage';
import MonthlyClosePage from './pages/MonthlyClosePage';
import CashDashboardPage from './pages/CashDashboardPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [dataMode, setDataMode] = useState(() => {
    return localStorage.getItem('luca-data-mode') || 'demo';
  });
  const [chatPreload, setChatPreload] = useState(null);

  useEffect(() => {
    localStorage.setItem('luca-data-mode', dataMode);
  }, [dataMode]);

  const handleNavigateToChat = useCallback((task) => {
    setChatPreload(`Let's review the monthly close task: "${task.task}". Can you walk me through what was done and confirm it's ready to mark complete?`);
    setActiveTab('chat');
  }, []);

  const handleNavigateToChatDirect = useCallback((question) => {
    setChatPreload(question);
    setActiveTab('chat');
  }, []);

  const consumePreload = useCallback(() => {
    const msg = chatPreload;
    setChatPreload(null);
    return msg;
  }, [chatPreload]);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} dataMode={dataMode} onDataModeChange={setDataMode}>
      {activeTab === 'close' ? (
        <MonthlyClosePage onNavigateToChat={handleNavigateToChat} />
      ) : activeTab === 'cash' ? (
        <CashDashboardPage onNavigateToChat={handleNavigateToChatDirect} />
      ) : (
        <ProcessManualPage dataMode={dataMode} consumePreload={consumePreload} />
      )}
    </Layout>
  );
}
