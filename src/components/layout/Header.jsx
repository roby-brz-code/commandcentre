const tabLabels = {
  manual: 'Process Manual',
  dashboard: 'Cash Dashboard',
  query: 'Query',
  recon: 'Recon Status',
  tasks: "Today's Tasks",
  tax: 'Tax Calendar',
};

export default function Header({ activeTab }) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Breeze Finance</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium">{tabLabels[activeTab]}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <span className="text-breeze-blue text-xs font-semibold">BL</span>
        </div>
      </div>
    </header>
  );
}
