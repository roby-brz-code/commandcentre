import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [owlState, setOwlState] = useState('idle');
  const owlTimerRef = useRef(null);
  const [pageKey, setPageKey] = useState(0);

  useEffect(() => {
    localStorage.setItem('luca-data-mode', dataMode);
  }, [dataMode]);

  // Owl state helper: set a state then revert to idle after duration
  const flashOwl = useCallback((state, ms = 500) => {
    clearTimeout(owlTimerRef.current);
    setOwlState(state);
    owlTimerRef.current = setTimeout(() => setOwlState('idle'), ms);
  }, []);

  // Bump page key on tab change for fade-in
  const handleTabChange = useCallback((tab) => {
    if (tab !== activeTab) {
      flashOwl('excited', 500);
    }
    setActiveTab(tab);
    setPageKey((k) => k + 1);
  }, [activeTab, flashOwl]);

  const handleNavigateToChat = useCallback((task) => {
    setChatPreload(`Let's review the monthly close task: "${task.task}". Can you walk me through what was done and confirm it's ready to mark complete?`);
    setActiveTab('chat');
    setPageKey((k) => k + 1);
  }, []);

  const handleNavigateToChatDirect = useCallback((question) => {
    setChatPreload(question);
    setActiveTab('chat');
    setPageKey((k) => k + 1);
  }, []);

  const consumePreload = useCallback(() => {
    const msg = chatPreload;
    setChatPreload(null);
    return msg;
  }, [chatPreload]);

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange} dataMode={dataMode} onDataModeChange={setDataMode} owlState={owlState} flashOwl={flashOwl}>
      <div key={pageKey} className="page-enter">
        {activeTab === 'close' ? (
          <MonthlyClosePage onNavigateToChat={handleNavigateToChat} />
        ) : activeTab === 'cash' ? (
          <CashDashboardPage onNavigateToChat={handleNavigateToChatDirect} />
        ) : (
          <ProcessManualPage dataMode={dataMode} consumePreload={consumePreload} owlState={owlState} setOwlState={setOwlState} flashOwl={flashOwl} />
        )}
      </div>
    </Layout>
  );
}
