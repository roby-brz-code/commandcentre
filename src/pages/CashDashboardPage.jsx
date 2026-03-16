import { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(target * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return value;
}

const TREND_DATA = [
  { month: 'Mar 25', total: 4.8, mfp: 0.3, net: 4.5 },
  { month: 'Apr 25', total: 5.6, mfp: 0.5, net: 5.1 },
  { month: 'May 25', total: 6.2, mfp: 0.7, net: 5.5 },
  { month: 'Jun 25', total: 7.1, mfp: 0.9, net: 6.2 },
  { month: 'Jul 25', total: 8.4, mfp: 1.1, net: 7.3 },
  { month: 'Aug 25', total: 10.2, mfp: 1.4, net: 8.8 },
  { month: 'Sep 25', total: 12.8, mfp: 1.7, net: 11.1 },
  { month: 'Oct 25', total: 15.4, mfp: 2.0, net: 13.4 },
  { month: 'Nov 25', total: 18.2, mfp: 2.4, net: 15.8 },
  { month: 'Dec 25', total: 21.6, mfp: 2.8, net: 18.8 },
  { month: 'Jan 26', total: 24.8, mfp: 3.2, net: 21.6 },
  { month: 'Feb 26', total: 27.4, mfp: 3.5, net: 23.9 },
  { month: 'Mar 26', total: 28.6, mfp: 3.8, net: 24.8 },
];

const FLOW_DATA = [
  { month: 'Oct', inflows: 6.2, outflows: 4.1 },
  { month: 'Nov', inflows: 6.8, outflows: 4.6 },
  { month: 'Dec', inflows: 7.4, outflows: 5.2 },
  { month: 'Jan', inflows: 7.9, outflows: 5.6 },
  { month: 'Feb', inflows: 8.2, outflows: 5.8 },
  { month: 'Mar*', inflows: 4.4, outflows: 3.2 },
];

const BANK_ACCOUNTS = [
  { name: 'Treasury Reserve', balance: 18240400 },
  { name: 'PSP Settlement Account', balance: 4620200 },
  { name: 'Operating Checking', balance: 2186400 },
  { name: 'Sweep Account', balance: 1420000 },
  { name: 'Primary Checking', balance: 892600 },
  { name: 'AP Platform Clearing', balance: 184200 },
  { name: 'Merchant Settlement', balance: 42800 },
];

const CRYPTO_WALLETS = [
  { name: 'Digital Asset Treasury', balance: 1480200 },
  { name: 'Withdrawal Fee Wallet', balance: 1124600 },
  { name: 'Payout Provider Float', balance: 486400 },
];

const ALERTS = [
  { status: 'ok', text: 'Net attributable cash: $24.8M (healthy — covers 4.2 months of operating expenses)', question: "What's our current net attributable cash position and runway?" },
  { status: 'ok', text: 'Settlement buffer adequate ($800K surplus over MFP)', question: 'Show me the current merchant settlement obligations and buffer' },
  { status: 'ok', text: 'Payout float funded for weekend', question: "What's the current payout float status?" },
  { status: 'warn', text: 'PSP Clearing balance elevated (-$2.4M) — review pending journals', question: "What's causing the elevated PSP Clearing balance?" },
  { status: 'ok', text: 'All bank reconciliations current as of Mar 12', question: "What's the status of our bank reconciliations?" },
];

function fmt(n) {
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtFull(n) {
  return `$${n.toLocaleString()}`;
}

function AnimatedValue({ target, prefix = '$', suffix = 'M', decimals = 1 }) {
  const v = useCountUp(Math.abs(target), 1000);
  const sign = target < 0 ? '-' : '';
  return <>{sign}{prefix}{v.toFixed(decimals)}{suffix}</>;
}

function SummaryCard({ label, numericTarget, suffix, decimals, change, changeColor, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`hover-lift bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-[#E2E8F0] p-5 text-left cursor-pointer ${
        accent ? 'border-l-[3px] border-l-breeze-blue' : ''
      }`}
    >
      <p className="text-xs font-medium text-[#64748B] mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ? 'text-breeze-blue' : 'text-[#0E1A2B]'}`}>
        <AnimatedValue target={numericTarget} suffix={suffix || 'M'} decimals={decimals ?? 1} />
      </p>
      {change && (
        <p className={`text-xs font-medium mt-1 ${changeColor || 'text-[#16A34A]'}`}>{change}</p>
      )}
    </button>
  );
}

function AccountRow({ name, balance, maxBalance, onClick }) {
  const pct = (balance / maxBalance) * 100;
  return (
    <button onClick={onClick} className="flex items-center gap-3 py-2.5 w-full text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#0E1A2B] truncate">{name}</p>
        <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-breeze-blue/20 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-sm font-semibold text-[#0E1A2B] shrink-0 tabular-nums">{fmtFull(balance)}</span>
    </button>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-[#0E1A2B] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: ${p.value.toFixed(1)}M
        </p>
      ))}
    </div>
  );
}

function FlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-[#0E1A2B] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: ${p.value.toFixed(1)}M
        </p>
      ))}
    </div>
  );
}

const RANGES = { '3M': 3, '6M': 6, '12M': 12, 'All': 99 };

export default function CashDashboardPage({ onNavigateToChat }) {
  const [range, setRange] = useState('All');

  const trendSlice = TREND_DATA.slice(-RANGES[range]);

  function ask(q) {
    if (onNavigateToChat) onNavigateToChat(q);
  }

  const bankMax = Math.max(...BANK_ACCOUNTS.map((a) => a.balance));
  const cryptoMax = Math.max(...CRYPTO_WALLETS.map((a) => a.balance));

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-[#0E1A2B]">Cash Dashboard</h1>
          <p className="text-xs text-[#64748B] mt-0.5">As of March 15, 2026</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-4">
          <SummaryCard
            label="Total Cash Held"
            numericTarget={28.6}
            change="&#9650; +4.1% vs last month"
            onClick={() => ask("What's our total cash held across all accounts?")}
          />
          <SummaryCard
            label="Settlement Owed to Merchants"
            numericTarget={-3.8}
            change="Merchant Funds Payable"
            changeColor="text-[#DC2626]"
            onClick={() => ask('Show me the current merchant settlement obligations')}
          />
          <SummaryCard
            label="Net Attributable Cash"
            numericTarget={24.8}
            change="&#9650; +4.8% vs last month"
            accent
            onClick={() => ask("What's our net attributable cash after deducting merchant obligations?")}
          />
          <SummaryCard
            label="Crypto Wallets"
            numericTarget={3.1}
            change="3 wallets"
            changeColor="text-[#64748B]"
            onClick={() => ask('Show me the current crypto wallet balances')}
          />
          <SummaryCard
            label="Credit Cards Outstanding"
            numericTarget={-310}
            suffix="K"
            decimals={0}
            change="3 cards"
            changeColor="text-[#DC2626]"
            onClick={() => ask("What's the current credit card outstanding balance?")}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Trend chart */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0E1A2B]">Net Attributable Cash Trend</h2>
              <div className="flex gap-1">
                {Object.keys(RANGES).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                      range === r ? 'bg-breeze-blue text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendSlice} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F6DF6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2F6DF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="total" name="Total Cash" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="6 3" fill="none" dot={false} />
                <Area type="monotone" dataKey="net" name="Net Attributable" stroke="#2F6DF6" strokeWidth={2} fill="url(#netFill)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Flow chart */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
            <h2 className="text-sm font-semibold text-[#0E1A2B] mb-4">Cash Inflows vs Outflows</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={FLOW_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -10 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<FlowTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="inflows" name="Inflows" fill="#16A34A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflows" name="Outflows" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Three columns */}
        <div className="grid grid-cols-3 gap-4">
          {/* Bank accounts */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
            <h2 className="text-sm font-semibold text-[#0E1A2B] mb-3">Bank Accounts</h2>
            <div className="space-y-0.5">
              {BANK_ACCOUNTS.map((a) => (
                <AccountRow
                  key={a.name}
                  name={a.name}
                  balance={a.balance}
                  maxBalance={bankMax}
                  onClick={() => ask(`Tell me about the ${a.name} balance`)}
                />
              ))}
            </div>
            <div className="border-t border-[#F1F5F9] mt-3 pt-3 flex justify-between">
              <span className="text-xs font-medium text-[#64748B]">Total</span>
              <span className="text-sm font-bold text-[#0E1A2B]">{fmtFull(BANK_ACCOUNTS.reduce((s, a) => s + a.balance, 0))}</span>
            </div>
          </div>

          {/* Crypto wallets */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
            <h2 className="text-sm font-semibold text-[#0E1A2B] mb-3">Crypto Wallets</h2>
            <div className="space-y-0.5">
              {CRYPTO_WALLETS.map((a) => (
                <AccountRow
                  key={a.name}
                  name={a.name}
                  balance={a.balance}
                  maxBalance={cryptoMax}
                  onClick={() => ask(`Tell me about the ${a.name} balance`)}
                />
              ))}
            </div>
            <div className="border-t border-[#F1F5F9] mt-3 pt-3 flex justify-between">
              <span className="text-xs font-medium text-[#64748B]">Total</span>
              <span className="text-sm font-bold text-[#0E1A2B]">{fmtFull(CRYPTO_WALLETS.reduce((s, a) => s + a.balance, 0))}</span>
            </div>
          </div>

          {/* Settlement obligations */}
          <button
            onClick={() => ask('Show me the current merchant settlement obligations')}
            className="hover-lift bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 text-left hover:border-breeze-blue/30 cursor-pointer"
          >
            <h2 className="text-sm font-semibold text-[#0E1A2B] mb-3">Settlement Obligations</h2>

            <div className="mb-4">
              <p className="text-xs text-[#64748B]">Total Merchant Funds Payable</p>
              <p className="text-xl font-bold text-[#DC2626]">-$3,820,400</p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Daily settlement merchants</span>
                <span className="font-medium text-[#0E1A2B]">$1,240,800</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Weekly settlement merchants</span>
                <span className="font-medium text-[#0E1A2B]">$2,180,400</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Monthly settlement merchants</span>
                <span className="font-medium text-[#0E1A2B]">$399,200</span>
              </div>
            </div>

            <div className="border-t border-[#F1F5F9] pt-3 mb-3">
              <p className="text-xs font-medium text-[#0E1A2B] mb-1">Settlement Buffer</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-[#64748B]">PSP Settlement:</span>
                <span className="text-xs font-medium text-[#0E1A2B]">$4,620,200</span>
                <span className="text-xs text-[#64748B]">vs owed:</span>
                <span className="text-xs font-medium text-[#0E1A2B]">$3,820,400</span>
              </div>
              <p className="text-xs font-semibold text-[#16A34A] mt-1">$799,800 surplus &#10003;</p>
            </div>

            <div className="bg-[#F8FAFC] rounded-lg px-3 py-2">
              <p className="text-[11px] text-[#64748B]">Next settlement due</p>
              <p className="text-xs font-medium text-[#0E1A2B]">Tomorrow (Mon Mar 17) — ~$620K estimated</p>
            </div>
          </button>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
          <h2 className="text-sm font-semibold text-[#0E1A2B] mb-3">Alerts &amp; Watchlist</h2>
          <div className="space-y-2">
            {ALERTS.map((a, i) => (
              <button
                key={i}
                onClick={() => ask(a.question)}
                className="flex items-start gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="text-base shrink-0 mt-0.5">
                  {a.status === 'ok' ? '\u2705' : '\u26A0\uFE0F'}
                </span>
                <span className={`text-sm ${a.status === 'warn' ? 'text-[#D97706]' : 'text-[#334155]'}`}>
                  {a.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
