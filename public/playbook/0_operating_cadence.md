# 0. Operating Cadence

This is the agent-readable layer. It maps every recurring finance task to a frequency and day, separated from the detailed process docs in the sections below. This page contains no sensitive data — safe to feed to Marvin or any AI assistant.

---

## Daily

| Task | Section | Detail |
| --- | --- | --- |
| Monitor settlement execution (via Peng’s dashboard) | Settlements | See Section 5 |
| Send out USDC settlements + SVB transfers | Settlements | See Section 5 |
| Check cash positions / treasury balances | Treasury | See Section 9 |
| Review CKO Clearing balance (should trend toward zero) | Reconciliation | See Section 6 |
| AptPay liquidity check — confirm no manual top-ups needed | Treasury | See Section 9 |

---

## Weekly

| Task | Day | Section | Detail |
| --- | --- | --- | --- |
| Run revenue journal queries + import to QBO (weekly) | Mon/Tue | Revenue | See Section 1 |
| Run CKO fee journal queries + import to QBO (weekly) | Mon/Tue | Revenue | See Section 1 |
| AP review + approvals (45 mins) | Tuesday | AP | See Section 7 |
| AP review + approvals (45 mins) | Thursday | AP | See Section 7 |
| Expense reimbursements review (Ramp) | Tue or Thu | AP | See Section 7 |
| Top up APT for payout liquidity | Friday | Treasury | See Section 9 |
| Top up AptPay weekend buffer (ensure float covers Sat–Sun payouts) | Friday | Treasury | See Section 9 |
| Transfer money from main account to Working Pool | As needed (~2x/week) | Treasury | See Section 9 |
| Manage EUR/USD conversion (when extracting) | As needed | Treasury | See Section 9 |
| Cash position report update | Friday | Treasury | See Section 9 |

---

## Monthly

| Task | Timing | Section | Detail |
| --- | --- | --- | --- |
| Month-end close (full checklist) | 1st–5th of following month | Close | See Section 3 |
| Chargeback close (pull data, generate journals) | Part of month-end | Chargebacks | See Section 2 |
| Prepaid amortization entries | Part of month-end | Prepaids | See Section 4 |
| Reconciliation sign-off (all flows) | Part of month-end | Reconciliation | See Section 6 |
| Profit extraction / sweep to bank | End of month or as needed | Treasury | See Section 9 |
| Merchant volume monitoring (approaching caps?) | Mid-month | Underwriting | See Section 8 |
| Tax filing check — confirm TaxJar submissions are correct | 15th of month | Tax | See Section 10 |
| MTL / state license tracker review | Last week of month | Tax | See Section 10 |

---

## Quarterly

| Task | Section | Detail |
| --- | --- | --- |
| Chargeback win rate health check (filing cohort analysis) | Chargebacks | See Section 2 |
| Sales tax filing verification (confirm TaxJar filed correctly in all states) | Tax | See Section 10 |
| Transfer pricing review with KPMG | Tax | See Section 10 |
| MTL / state license application status check | Tax | See Section 10 |

---

## Ongoing / As-Needed

| Task | Trigger | Section |
| --- | --- | --- |
| State license applications (MTLs) | New state requirements or expansion | Tax |
| Tax filing deadline tracking (federal, state, international) | Calendar-driven | Tax |
| EUR/USD conversion execution | When extracting from EUR accounts | Treasury |
| Profit sweep to operating account | Cash accumulation threshold | Treasury |

---

## FP&A Cadence (Suggested)

Currently no formal FP&A rhythm. Recommended cadence:

| Task | Timing | Notes |
| --- | --- | --- |
| Flash report (revenue, volume, key metrics) | Weekly (Monday) | Quick Sigma pull — 15 mins |
| Monthly financial review (P&L, BS, cash) | 5th–7th of following month (after close) | Full review once books are closed |
| Variance commentary | Same as above | What moved, why, what to watch |
| Rolling forecast update | Monthly or quarterly | Update revenue/expense projections |
| Board/leadership pack | Monthly or as needed | Key metrics, narrative, cash runway |
| Budget vs actual | Quarterly (once 2026 budget built) | Defer until HoF builds budget |