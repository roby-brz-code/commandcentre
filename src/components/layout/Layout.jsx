import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ activeTab, onTabChange, mode, onModeChange, children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header mode={mode} onModeChange={onModeChange} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
