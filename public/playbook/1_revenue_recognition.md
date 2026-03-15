# 1. Revenue Recognition

## Business Context

Breeze is a payment processor handling ~$300M monthly volume. CKO ([Checkout.com](http://Checkout.com)) processes card transactions, deposits net funds to Mercury, and Breeze settles to merchants via USDC or fiat, taking a processing fee (4.9% + $0.30).

**Key principle:** Revenue is recognized at settlement based on the `confirmedAt` timestamp — not when the customer initially paid. Different merchants have different settlement cycles (T+1, T+3, T+7, T+14, T+30).

---

## CKO Clearing Reconciliation Framework

CKO sends one **net deposit** per day. Breeze must track each component separately. **CKO Clearing** (account 1989) is the reconciliation account where two independent data sources meet:

| Entry | Source | Direction |
| --- | --- | --- |
| Bank feed (net deposit) | Mercury | Credit to CKO Clearing |
| Revenue journal (gross volume) | Breeze payments DB | Debit to CKO Clearing |
| CKO fee gross-up | CKO financial actions | Credit to CKO Clearing |
| Chargeback/refund/adjustment gross-up | CKO financial actions | Credit to CKO Clearing |
| **Net CKO Clearing** |  | **$0** |

**Reconciliation formula:** Bank Feed + CKO Fees + Chargebacks + Refunds + Adjustments = Gross Volume

Small daily variances (~0.03%) are normal due to timezone cutoffs between `confirmedAt` (Breeze) and `Processed_On` (CKO). These net out over the week.

---

## Worked Example — $500 gross, $10 CKO fees, $100 chargeback

| Entry | Dr | Cr | CKO Clearing Balance |
| --- | --- | --- | --- |
| Bank feed | Mercury $390 | CKO Clearing $390 | ($390) |
| Revenue journal | CKO Clearing $500 | MFP/Revenue $500 | $110 |
| CKO fee journal | CKO Fees $10 | CKO Clearing $10 | $100 |
| Chargeback journal | CB Expense $100 | CKO Clearing $100 | **$0** ✓ |

---

## Journal 1: Revenue Journals (Weekly, Per Merchant)

**Source:** `staging_payments_hi` using `confirmedAt` timestamp

```
Dr: CKO Clearing (1989)              [gross_volume]
    Cr: Merchant Funds Payable (2040)     [merchant_payable]
    Cr: Payin Revenue (4010)              [breeze_fees]
```

- One journal per merchant per day within the week (auto-numbered via `DENSE_RANK()`)
- Run weekly (Mon/Tue) covering the prior week
- `gross_volume` = total `settleGrossAmount` for CONFIRMED transactions
- `breeze_fees` = total `feeAmount` (4.9% + $0.30 per txn)
- `merchant_payable` = gross_volume − breeze_fees
- Description format: `Payin rev rec - [Merchant Name] - [YYYY-MM-DD]`

### Weekly Operations Workflow

**Sigma Workbook:** [2026 Revenue and Reconciliation Workbook](https://app.sigmacomputing.com/breeze/workbook/2026-Revenue-and-Reconciliation-Workbook-4uxTjgyhPrDluNDcK12mTf)

1. **Run the QBO Journal Import query** in the Sigma workbook with the prior week’s date range
2. **Export as CSV** from Sigma
3. **Import to QBO:** Settings → Import Data → Journal Entries
4. **Review and post**

All SQL queries live in the Sigma workbook linked above.

---

## Journal 2: CKO Fee Journals (Weekly)

**Source:** `checkout_report_financial_actions_raw_latest` using `Processed_On` timestamp

```
Dr: CKO Fees - COGS (5013)           [total_processing_fees]
    Cr: CKO Clearing (1989)              [total_processing_fees]
```

- One journal per day (journal numbers start at 10000+)
- Includes: interchange, scheme, gateway, auth, chargeback handling fees, refund fees, billing fees, tiered pricing adjustments
- Does NOT include chargeback amounts or refund amounts (separate process — see Section 2)

---

## Journal 3: Bank Feed (Automatic via QBO)

```
Dr: Mercury Checking                  [payout_amount]
    Cr: CKO Clearing (1989)              [payout_amount]
```

This is auto-categorized in QBO via bank feed. No manual action required — just verify it’s hitting CKO Clearing during bank reconciliation.

---

## Payout Revenue (Separate Process)

- Payout revenue booked via manual journal after pulling payout report
- Entry: `Dr: Payout Fee Wallet | Cr: Payout Fee Revenue`
- Payout Fee Wallet (47c0) is not connected to QBO — QBO figure must reconcile to on-chain balance

---

## Timestamp Alignment

| Data Source | Timestamp | Used For |
| --- | --- | --- |
| Breeze payments (`staging_payments_hi`) | `confirmedAt` | Revenue recognition, merchant payable |
| CKO financial actions | `Processed_On` | CKO fees, chargebacks, refunds |

**Month-End Cutoff:** Revenue journals use `confirmedAt`; CKO fee journals use `Processed_On` (matches when CKO hits the bank).

---

## Chart of Accounts (Revenue)

| Account | Type | QBO Name | Purpose |
| --- | --- | --- | --- |
| 1989 | Other Current Asset | CKO Clearing | Reconciliation clearing account |
| 5013 | COGS | CKO Fees | CKO processing fees |
| 2040 | Current Liability | Merchant Funds Payable - Payins | Amounts owed to merchants |
| 4010 | Income | Payin Revenue | Breeze processing fee revenue |

---

## Data Sources

| Table | Content | Key Fields |
| --- | --- | --- |
| `staging_payments_hi` | Breeze payment records | confirmedAt, settleGrossAmount, feeAmount, merchantId, status |
| `staging_merchants_hf` | Merchant details | document_id, name |
| `checkout_report_financial_actions_raw_latest` | CKO transaction-level data | Processed_On, Action_Type, Breakdown_Type, Holding_Currency_Amount |
| `checkout_report_payouts_raw_latest` | CKO daily payout summaries | Payout_Date, Payments, Payout_Amount |

---

## Validation Controls

| Frequency | Check |
| --- | --- |
| Daily | Compare dashboard totals against CKO payout report |
| Weekly | CKO Clearing should trend toward zero; timing differences <1% are normal |
| Monthly | Reconcile CKO Clearing balance — material residual = missing entry type |