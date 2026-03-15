import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ activeTab, onTabChange, children }) {
  const isChat = activeTab === 'manual';

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} />
        <main className={`flex-1 ${isChat ? '' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
