# 4. Prepaid Amortization & Year-End

## Prepaid Expense Amortization

Prepaid software/subscriptions coded to prepaid asset account on payment. Monthly amortization journal recognizes expense over the service period.

**Payment entry:**

```
Dr: Prepaid Software           [full amount]
    Cr: Cash/AP                [full amount]
```

**Monthly amortization:**

```
Dr: Software Expense           [monthly amount]
    Cr: Prepaid Software       [monthly amount]
```

**Example:** $90k annual subscription → $7,500/month amortization over 12 months.

### Options in [Bill.com](http://Bill.com)

1. Manual recurring journal entries (recommended)
2. Set up in QBO if synced
3. Expense account with manual tracking spreadsheet
4. Split bill into 12 line items with different expense dates

---

## Year-End Entries & Accruals

### Revenue Accruals

For transactions confirmed on Dec 31 but not settled until after year-end:

```
Dec 31:  Dr: Receivables         | Cr: Flow 1 Revenue
Jan:     Dr: Cash                | Cr: Receivables
```

Settlement accrual (net of fiat in vs fiat out):

```
Dec 31:  Dr: Flow 1 Revenue      | Cr: Accruals
Jan:     Dr: Accruals             | Cr: Flow 1 Revenue  (reversal)
```

### Opening Balance Approach

- Track adjustments as presentation-only (no income impact) vs error corrections (may affect tax return)
- Provide auditors a proactive schedule of identified corrections

---

## Audit Preparation

### Overview

First full audit (SingerLewak, Q1 2026) covering 2025 fiscal year ($72M revenue).

### Key Focus Areas

1. **Revenue testing** — 9x growth ($8M → $72M), critical audit area
2. **Balance sheet complexity** — merchant settlement liabilities, funds in transit, crypto holdings
3. **Chargebacks** — liability and expense recognition

### Audit Evidence Prepared

- Bank reconciliations rolled forward month-by-month
- Revenue recognition process documentation
- GL account explanations
- Fund flow diagrams
- Balance sheet reconciliations

### Engagement Notes

- Financial statement preparation included in scope
- Tax prep excluded (separate engagement)
- Out-of-scope reconciliation support billed hourly