import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ activeTab, onTabChange, dataMode, onModeChange, children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} dataMode={dataMode} onModeChange={onModeChange} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
