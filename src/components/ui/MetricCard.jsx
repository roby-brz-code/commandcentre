import Card from './Card';
import StatusChip from './StatusChip';

export default function MetricCard({ label, value, delta, accent }) {
  return (
    <Card accent={accent} className="p-5">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-gray-500">{label}</p>
        {delta !== undefined && <StatusChip value={delta} />}
      </div>
    </Card>
  );
}
