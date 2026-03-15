const cashPositions = [
  { account: 'Operating Account', bank: 'JPMorgan Chase', balance: 2847392.50, currency: 'GBP', trend: 'up' },
  { account: 'Settlement Reserve', bank: 'Barclays', balance: 1523847.00, currency: 'GBP', trend: 'down' },
  { account: 'Merchant Payouts', bank: 'ClearBank', balance: 894210.33, currency: 'GBP', trend: 'up' },
  { account: 'Tax Reserves', bank: 'HSBC', balance: 412500.00, currency: 'GBP', trend: 'flat' },
];

const recentFlows = [
  { description: 'CKO Settlement - Batch #4821', amount: 342150.00, type: 'inflow', time: '09:15' },
  { description: 'Merchant Payout - Wave 1', amount: -187420.00, type: 'outflow', time: '10:30' },
  { description: 'Stripe Settlement - Daily', amount: 94830.50, type: 'inflow', time: '11:00' },
  { description: 'HMRC VAT Payment', amount: -62300.00, type: 'outflow', time: '11:45' },
  { description: 'Adyen Settlement - Batch #892', amount: 128475.00, type: 'inflow', time: '12:15' },
  { description: 'Payroll - March', amount: -215600.00, type: 'outflow', time: '14:00' },
];

const kpis = [
  { label: 'Total Cash Position', value: '£5.68M', change: '+2.3%', positive: true },
  { label: 'Net Flow Today', value: '£100.1K', change: '+£100.1K', positive: true },
  { label: 'Pending Settlements', value: '£1.24M', change: '12 batches', positive: null },
  { label: 'Days Cash Runway', value: '94 days', change: '-2 days', positive: false },
];

function formatCurrency(n) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
}

function TrendIcon({ trend }) {
  if (trend === 'up') return <span className="text-emerald-500 text-xs font-medium">▲</span>;
  if (trend === 'down') return <span className="text-red-400 text-xs font-medium">▼</span>;
  return <span className="text-gray-400 text-xs">—</span>;
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
            <p className={`text-xs mt-1 ${kpi.positive === true ? 'text-emerald-500' : kpi.positive === false ? 'text-red-400' : 'text-gray-400'}`}>
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Cash Positions */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-card">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Cash Positions</h3>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded">Mock Data</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Account</th>
                <th className="text-left px-5 py-3 font-medium">Bank</th>
                <th className="text-right px-5 py-3 font-medium">Balance</th>
                <th className="text-center px-5 py-3 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {cashPositions.map((row) => (
                <tr key={row.account} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{row.account}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{row.bank}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-800 text-right font-mono">{formatCurrency(row.balance)}</td>
                  <td className="px-5 py-3.5 text-center"><TrendIcon trend={row.trend} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50/50">
                <td className="px-5 py-3 text-sm font-semibold text-gray-800" colSpan={2}>Total</td>
                <td className="px-5 py-3 text-sm font-semibold text-gray-800 text-right font-mono">
                  {formatCurrency(cashPositions.reduce((s, r) => s + r.balance, 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Recent Cash Flows */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Today's Cash Flows</h3>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded">Mock Data</span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentFlows.map((flow, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50">
                <div>
                  <p className="text-sm text-gray-700">{flow.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{flow.time}</p>
                </div>
                <span className={`text-sm font-mono font-medium ${flow.type === 'inflow' ? 'text-emerald-500' : 'text-red-400'}`}>
                  {flow.type === 'inflow' ? '+' : ''}{formatCurrency(Math.abs(flow.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
