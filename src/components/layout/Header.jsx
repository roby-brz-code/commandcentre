export default function Header() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Luca</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium">Chat</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <span className="text-breeze-blue text-xs font-semibold">BL</span>
        </div>
      </div>
    </header>
  );
}
