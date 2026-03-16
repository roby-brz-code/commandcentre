export const PHASES = {
  'Revenue Recognition': '#2F6DF6',
  'Chargebacks': '#7C3AED',
  'Cash Recon': '#059669',
  'AP & Expenses': '#D97706',
  'Close the Books': '#0E1A2B',
  'Other': '#64748B',
};

export const ASSIGNEES = ['Roby', 'Bill', 'Millie', 'Peng', 'Unassigned'];

export const DEFAULT_TASKS = [
  // Revenue Recognition (Days 1-2)
  { id: 'rev-1', task: 'Run and import weekly revenue journals to QBO', phase: 'Revenue Recognition', dueDay: 'Day 1-2' },
  { id: 'rev-2', task: 'Run and import CKO fee journals to QBO', phase: 'Revenue Recognition', dueDay: 'Day 1-2' },
  { id: 'rev-3', task: 'Month-end cutoff check', phase: 'Revenue Recognition', dueDay: 'Day 1-2' },
  { id: 'rev-4', task: 'Verify off-ramp new user fees captured', phase: 'Revenue Recognition', dueDay: 'Day 1-2' },
  { id: 'rev-5', task: 'Verify chargeback fees and misc fees captured', phase: 'Revenue Recognition', dueDay: 'Day 1-2' },
  { id: 'rev-6', task: 'Export fee transactions and compare to fee calc', phase: 'Revenue Recognition', dueDay: 'Day 1-2' },
  { id: 'rev-7', task: 'Pull payout report and post payout revenue journal', phase: 'Revenue Recognition', dueDay: 'Day 1-2' },
  // Chargeback Close (Days 1-3)
  { id: 'cb-1', task: 'Pull Financial Actions from BigQuery (ADJM/RPDW)', phase: 'Chargebacks', dueDay: 'Day 1-3' },
  { id: 'cb-2', task: 'Pull Disputes Report from CKO Hub', phase: 'Chargebacks', dueDay: 'Day 1-3' },
  { id: 'cb-3', task: 'Generate chargeback journals via Claude', phase: 'Chargebacks', dueDay: 'Day 1-3' },
  { id: 'cb-4', task: 'Verify closing balance ties to rollforward', phase: 'Chargebacks', dueDay: 'Day 1-3' },
  { id: 'cb-5', task: 'Import chargeback journals to QBO', phase: 'Chargebacks', dueDay: 'Day 1-3' },
  { id: 'cb-6', task: 'Save workbook to Google Drive month-end folder', phase: 'Chargebacks', dueDay: 'Day 1-3' },
  // Cash Reconciliation (Days 2-3)
  { id: 'cash-1', task: 'Reconcile all bank accounts in QBO', phase: 'Cash Recon', dueDay: 'Day 2-3' },
  { id: 'cash-2', task: 'Reconcile credit card accounts', phase: 'Cash Recon', dueDay: 'Day 2-3' },
  { id: 'cash-3', task: 'Pull crypto wallet balances at month-end', phase: 'Cash Recon', dueDay: 'Day 2-3' },
  { id: 'cash-4', task: 'Compare QBO crypto balances to on-chain', phase: 'Cash Recon', dueDay: 'Day 2-3' },
  { id: 'cash-5', task: 'Compile month-end cash position report', phase: 'Cash Recon', dueDay: 'Day 2-3' },
  { id: 'cash-6', task: 'CKO Clearing balance check', phase: 'Cash Recon', dueDay: 'Day 2-3' },
  // AP & Expenses (Days 2-4)
  { id: 'ap-1', task: 'Review Bill.com for unprocessed invoices', phase: 'AP & Expenses', dueDay: 'Day 2-4' },
  { id: 'ap-2', task: 'Accrue unrecorded expenses (>$1K)', phase: 'AP & Expenses', dueDay: 'Day 2-4' },
  { id: 'ap-3', task: 'Post prepaid amortization entries', phase: 'AP & Expenses', dueDay: 'Day 2-4' },
  { id: 'ap-4', task: 'Verify Ramp card transactions coded', phase: 'AP & Expenses', dueDay: 'Day 2-4' },
  { id: 'ap-5', task: 'Post intercompany entries (US \u2194 SG)', phase: 'AP & Expenses', dueDay: 'Day 2-4' },
  // Close the Books (Days 4-5)
  { id: 'close-1', task: 'Final P&L review', phase: 'Close the Books', dueDay: 'Day 4-5' },
  { id: 'close-2', task: 'Final Balance Sheet review', phase: 'Close the Books', dueDay: 'Day 4-5' },
  { id: 'close-3', task: 'Generate financial reports', phase: 'Close the Books', dueDay: 'Day 4-5' },
  { id: 'close-4', task: 'Variance analysis vs prior month', phase: 'Close the Books', dueDay: 'Day 4-5' },
  { id: 'close-5', task: 'Reconciliation sign-off', phase: 'Close the Books', dueDay: 'Day 4-5' },
];

export const COLUMNS = ['not_started', 'in_progress', 'in_review', 'complete'];

export const COLUMN_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  in_review: 'In Review',
  complete: 'Complete',
};
