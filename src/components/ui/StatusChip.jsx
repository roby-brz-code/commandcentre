export default function StatusChip({ value, suffix = '%' }) {
  const isPositive = value > 0;
  const isZero = value === 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isZero
          ? 'text-gray-500'
          : isPositive
            ? 'text-emerald-600'
            : 'text-red-600'
      }`}
    >
      {!isZero && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          {isPositive ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
          )}
        </svg>
      )}
      {isPositive && '+'}{value}{suffix}
    </span>
  );
}
