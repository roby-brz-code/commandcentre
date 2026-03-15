# 3. Month-End Close Checklist

**Timing:** 1st–5th of following month | **Owner:** Finance Lead

---

## Step 1: Revenue Recognition (Days 1–2)

- [ ]  Catch up all revenue journals — ensure every week of the month has been run and imported to QBO (weekly revenue journal query using `confirmedAt`, run from [Sigma workbook](https://app.sigmacomputing.com/breeze/workbook/2026-Revenue-and-Reconciliation-Workbook-4uxTjgyhPrDluNDcK12mTf))
- [ ]  Catch up all CKO fee journals — ensure every week’s processing fees are posted (weekly CKO fee query using `Processed_On`)
- [ ]  Month-end cutoff check — verify no revenue from the following month has been included
- [ ]  Verify off-ramp new user fees captured
- [ ]  Verify chargeback fees and other misc fees captured
- [ ]  Export fee transactions from database — compare to fee calculation spreadsheet
- [ ]  Payout revenue — pull payout report, generate and post journal

---

## Step 2: Chargeback Close (Days 1–3)

- [ ]  Pull Financial Actions from BigQuery (filter `Action_Type = 'Chargeback'`, get ADJM and RPDW totals)
- [ ]  Pull Disputes Report from CKO Hub (manual CSV export)
- [ ]  Upload both files to Claude with: month, journal date, opening Chargebacks in Dispute balance
- [ ]  Review Claude output: Journal 1 (ADJM), Journal 2 (RPDW), Journal 3 (confirmed losses)
- [ ]  Verify closing balance ties to opening + taken − returned − losses
- [ ]  Import journals to QBO
- [ ]  Save completed workbook to Google Drive month-end folder

---

## Step 3: Cash Reconciliation (Days 2–3)

- [ ]  Reconcile all bank accounts in QBO: Mercury Checking, SVB, Brex Merchant Settlement, Brex Primary Checking, Singapore banking (DBS)
- [ ]  Reconcile credit card accounts in QBO
- [ ]  Pull crypto wallet balances at month-end (Polygonscan or BigQuery): 47c0 (Payout Fee Wallet), 31a0 (Polygon Payin Treasury), 2bbf (USDC Cycling Wallet)
- [ ]  Compare QBO crypto balances to on-chain — flag and investigate any gaps
- [ ]  Compile month-end cash position report (all fiat + crypto across both entities)
- [ ]  CKO Clearing balance check — should be near zero; material residual = missing entry type

---

## Step 4: AP Accruals & Expense Recognition (Days 2–4)

- [ ]  Review [Bill.com](http://Bill.com) for any invoices received but not yet processed for current month services
- [ ]  Accrue any unrecorded expenses for the month (threshold: >$1K)
- [ ]  Contact department heads for any missing invoices
- [ ]  Prepaid amortization entries: review prepaid software/COGS accounts, post monthly amortization journals
- [ ]  Ramp card transactions — ensure all coded and receipted
- [ ]  Intercompany entries (US ↔ SG): post any intercompany charges, verify intercompany balances agree between entities

---

## Step 5: Close the Books (Days 4–5)

- [ ]  Final P&L review — scan for anything unusual, missing, or misclassified
- [ ]  Final Balance Sheet review:
    - CKO Clearing ≈ $0
    - MFP balance reasonable (confirmed revenue minus settlements to date)
    - Chargebacks in Dispute balance ties to rollforward
    - Prepaids tie to amortization schedule
    - Bank/crypto balances tie to external statements
    - Intercompany balances tie between entities
- [ ]  Generate financial reports (P&L, BS, Cash Flow)
- [ ]  Variance analysis — compare to prior month, note significant movements
- [ ]  Reconciliation sign-off — all major reconciliations documented and clean

> **Note:** Don’t lock periods until opening balances and balance sheet fully cleaned up. Lock at year-end for tax/audit.
> 

---

## Monthly Calendar Template

| Day | Tasks |
| --- | --- |
| **1st** | Begin close. Catch up outstanding revenue/fee journals. Pull chargeback data (BigQuery + CKO Hub). |
| **2nd** | Continue revenue journals. Generate chargeback journals via Claude. Start bank reconciliations. |
| **3rd** | Complete bank/crypto reconciliations. Post chargeback journals. Review AP accruals. Post prepaid amortization. |
| **4th** | Post intercompany entries. Final P&L and BS review. Variance analysis. |
| **5th** | Reconciliation sign-off. Generate reports. Share with leadership. Close complete. |
| **15th** | Sales tax filing check (TaxJar). Merchant volume monitoring. |
| **Last week** | MTL tracker review. |

---

## Key Accounts to Review at Close

| Account | What to Check |
| --- | --- |
| CKO Clearing (1989) | Should be ≈ $0. Residual = missing journal type. |
| Merchant Funds Payable (2040) | = Confirmed revenue − all settlements to date. Should be positive and reasonable. |
| Chargebacks in Dispute | = Opening + ADJM − RPDW − Losses. Must tie to rollforward. |
| Prepaid Software | Must tie to amortization schedule. |
| Mercury/SVB/Brex | Must tie to bank statements at month-end. |
| Crypto wallets (QBO) | Must tie to on-chain balances at month-end. |
| Intercompany (US ↔ SG) | Balances must agree between entities. |

---

## Quarterly Add-Ons

- [ ]  Chargeback win rate health check (filing cohort analysis)
- [ ]  Sales tax deep compliance check (reconcile TaxJar vs QBO by state)
- [ ]  Transfer pricing review prep for KPMG
- [ ]  State license tracker — renewals, new applications
- [ ]  Budget vs actual review (once budget exists)

---

## Year-End Additional Items

- [ ]  Revenue accruals (transactions confirmed Dec 31 but not yet settled)
- [ ]  Settlement accruals (net settlement obligations at year-end)
- [ ]  Crypto presentation adjustment
- [ ]  Full chargeback year-end package (full-year disputes, subsequent events evidence, cohort win rate analysis, audit memo)
- [ ]  Audit prep package (bank recs rolled forward, rev rec documentation, GL explanations, fund flow diagrams, BS reconciliations)
- [ ]  Lock the period in QBO