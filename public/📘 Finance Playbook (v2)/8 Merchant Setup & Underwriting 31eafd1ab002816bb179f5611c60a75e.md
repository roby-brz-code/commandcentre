# 8. Merchant Setup & Underwriting

## Tiered Underwriting Approach

- **<$5M monthly volume or limited history:** Light-touch DD → confirm operational viability → full assessment at 6 months
- **>$5M monthly volume:** Full financial underwriting before onboarding
- **Rationale:** Small merchant fraud event at this scale won’t materially impact the business

---

## Financial Due Diligence Checklist

- [ ]  Last 6 months business bank statements (all operating accounts)
- [ ]  Most recent financial statements (P&L, Balance Sheet)
- [ ]  Prior year audited financials (if available)
- [ ]  Last 6 months processing statements from current/previous processor
- [ ]  Chargeback reports with ratios
- [ ]  For startups <6 months: business plan/pitch deck + source of funds

---

## Risk Signals

**Positive:** Established operating history with verifiable revenue, transparent business model with clear unit economics, clean chargeback history.

**Negative:** Mismatches between stated business and actual activity, excessive velocity or concentration risk, sudden volume spikes, recent processor terminations, high fraud ratios.

---

## Approval Process

- Underwriter gives recommendation
- Higher-level approval required before merchant goes live
- Tracked via CRM system

---

## Ongoing Monitoring

- Chargeback ratios, volume trends, payout ratios
- Alert system for anomalies (to be built)
- Rolling reserves for higher-risk merchants

---

## Volume Cap Monitoring

> ⚠️ **Needs to be built.** Dashboard showing merchants approaching approved volume caps, with alerts before they hit limits.
> 

Required: Pull current monthly volume per merchant from BigQuery, compare against approved cap (from merchant config or manual table), flag when >80% of cap.

---

## Merchant Fee Settings Audit

> ⚠️ **Needs to be built.** SQL query to pull current fee configuration from `dim_merchant_fee_df` in BigQuery and compare against contracted rates. Should flag any mismatches.
>