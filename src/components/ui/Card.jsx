const accentColors = {
  emerald: 'border-l-emerald-500',
  amber: 'border-l-amber-500',
  red: 'border-l-red-500',
  blue: 'border-l-blue-500',
  gray: 'border-l-gray-400',
};

export default function Card({ children, accent, className = '' }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${
        accent ? `border-l-4 ${accentColors[accent] || ''}` : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
