# 2. Chargeback Accounting

## Accounting Policy

Chargebacks are initially recorded as a receivable (**Chargebacks in Dispute**) when funds are debited by CKO. Chargeback expense is recognized only when the dispute is resolved unfavorably. Recoveries are recognized when funds are returned. No provision for pending disputes is recorded, supported by historical win rates of 78–99% across substantially-resolved cohorts (ASC 450 basis).

---

## Three Monthly Journals

### Journal 1 — Money Taken (Chargeback Filed, code ADJM)

```
Dr: Chargebacks in Dispute     [money_taken]
    Cr: CKO Clearing           [money_taken]
```

### Journal 2 — Money Returned (Dispute Won, code RPDW)

```
Dr: CKO Clearing               [money_returned]
    Cr: Chargebacks in Dispute  [money_returned]
```

### Journal 3 — Confirmed Losses (codes RPDL, ARBL, Dispute Accepted)

```
Dr: Chargeback Expense          [loss_amount]
    Cr: Chargebacks in Dispute   [loss_amount]
```

---

## Balance Rollforward

```
Opening CB in Dispute
+ Money Taken (ADJM)
- Money Returned (RPDW)
- Confirmed Losses
= Closing CB in Dispute
```

---

## Monthly Close Process

**Step 1 — Pull Two Data Files:**

1. Financial Actions from BigQuery (query filters `Action_Type = 'Chargeback'` with `ADJM` and `RPDW` breakdown types)
2. Disputes Report from CKO Hub (manual CSV export — BigQuery disputes table only has ~1 month rolling data, NOT suitable for historical analysis)

**Step 2 — Generate Journals via Claude:**

Upload both files with month, journal date, and opening balance. Claude deduplicates the disputes report to latest event per Dispute ID, classifies outcomes (Loss/Win/Pending), and produces:

- QBO-importable journal entries
- Monthly summary with all three journals and closing balance
- Rollforward tab (opening → debits → credits → closing)
- Raw disputes tab (deduplicated, classified, color-coded)

**Step 3 — Review, Post, and File:**

- Verify closing balance vs prior month
- Confirm QBO account names match, then import
- Save completed workbook to Google Drive month-end folder

---

## Quarterly Win Rate Health Check

Pull trailing 12-month disputes report from CKO Hub. Run **filing cohort** win rate analysis (disputes filed in month X → what % ultimately won). Do NOT use resolution-month analysis — it mixes cohorts and gives misleading results.

**Review trigger:** If cohorts >80% resolved show win rates below 65%, reassess whether a provision is required under ASC 450.

---

## Year-End Additional Steps

Pull full-year disputes report plus post-year-end disputes report for subsequent events evidence. Additional deliverables: year-end status classification, pending dispute breakdown, money taken vs disputes filed reconciliation, cohort win rate analysis, and audit file summary memo.

---

## Accounts

| Account | Type | Purpose |
| --- | --- | --- |
| Chargebacks in Dispute | Other Current Asset | Disputed amounts pending resolution |
| Chargeback Expense | Expense | Recognized on confirmed losses |
| CKO Clearing | Other Current Asset | Reconciles gross CKO activity to bank |

---

## CKO Codes

| Code | Meaning |
| --- | --- |
| ADJM | Money taken from settlement (chargeback filed) |
| RPDW | Money returned to settlement (dispute won) |
| RPDL | Dispute lost |
| ARBL | Arbitration lost |
| Dispute Accepted | Breeze accepted without contesting |