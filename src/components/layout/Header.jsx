export default function Header({ mode, onModeChange }) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Luca</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium">Chat</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Demo / Live toggle */}
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => onModeChange('demo')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'demo'
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Demo
          </button>
          <button
            onClick={() => onModeChange('live')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'live'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Live
          </button>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <span className="text-breeze-blue text-xs font-semibold">BL</span>
        </div>
      </div>
    </header>
  );
}
