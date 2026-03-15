# 12. Data & Analytics Infrastructure

## BigQuery Data Sources

| Table | Content | Key Fields |
| --- | --- | --- |
| `staging_payments_hi` | Breeze payment records | confirmedAt, settleGrossAmount, feeAmount, merchantId, status |
| `staging_merchants_hf` | Merchant details | document_id, name |
| `checkout_report_financial_actions_raw_latest` | CKO transaction-level data | Processed_On, Action_Type, Breakdown_Type, Holding_Currency_Amount |
| `checkout_report_payouts_raw_latest` | CKO daily payout summaries | Payout_Date, Payments, Payout_Amount |
| `offramp_request_raw_latest` | Offramp requests | offrampJobId, merchantId, amount |
| `offramp_raw_latest` | Completed offramps | senderMerchantId, completedAt, transactionFeeAmount |
| `dw.dim_merchant_fee_df` | Merchant fee schedules | merchant_id, payin_variable_fee, payin_fixed_fee |

### Data Architecture Notes

- Migrated from `raw_latest` views to partitioned staging tables mid-stream
- All finance queries updated for new table structures
- Key fields: `merchantId`, `createdAt`/`confirmedAt` (epoch milliseconds), `page.amount` (cents), `feeAmount`, `status`, `livemode`

---

## Sigma Dashboards

- Merchant settlement tracker (weekly operational use)
- Revenue by merchant
- Conversion metrics
- USDC requirements dashboard (for purchasing)

---

## Key SQL Queries Built

1. **Revenue journal import** — Daily per-merchant rev rec, QBO-importable CSV
2. **CKO fee journal import** — Daily processing fee gross-up
3. **Chargeback monthly query** — ADJM/RPDW amounts from financial actions
4. **Revenue dashboard** — Daily gross volume, revenue, merchant payable, CKO fees, gross profit
5. **Merchant settlement amounts** — Weekly calculation for settlement execution
6. **Merchant fee and volume analysis** — Volume, expected vs actual fees, net amounts
7. **Merchant names and volumes** — All merchants with dollar volume
8. **Offramp analytics** — User onboarding cohorts, retention, conversion