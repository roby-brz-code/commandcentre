# 6. Reconciliation

## CKO Clearing Reconciliation

CKO Clearing should net to approximately zero. Four entry types feed into it:

- **Revenue journals** (debit CKO Clearing with gross volume)
- **Bank feed** (credit CKO Clearing with net deposit)
- **CKO fee journals** (credit CKO Clearing with processing fees)
- **Chargeback/refund journals** (credit CKO Clearing with losses/adjustments)

**Daily:** Compare dashboard totals against CKO payout report.

**Weekly:** CKO Clearing trends toward zero; timing <1% of daily volume is normal.

**Monthly:** Material residual = missing entry type.

---

## Payin Reconciliation

Matches CKO cash receipts against settlement journals. CKO Receivable/Contra should net to zero but carries a balance due to ~1 week settlement delay.

**Data:** CKO reports, bank statements, BigQuery transaction data.

---

## Payout Reconciliation

Matches payout fee inflows (on-chain) against QBO recorded amounts.

**Key wallet:** 47c0 Payout Fee Wallet

**Known issue:** QBO balance ($11.07M) vs on-chain balance ($295k) — gap due to unbooked settlement outflows and Stake settlements from this wallet.

**Required entry to close gap:**

```
Dr: Merchant Funds Payable    [settlements out]
    Cr: Payout Fee Wallet     [settlements out]
```

---

## Float / Balance Reconciliation (Daily)

| Wallet | Expected Balance Logic |
| --- | --- |
| Escrow (Wallet 2) | Opening + inflows (from 7, from 4) − outflows (to 3, to 8) |
| Coinme Custodial (Wallet 3) | Opening + inflows (from 2) − outflows (to 4) |
| Cycling (Wallet 4) | Opening + inflows (from 3) − outflows (to 2) |
| Fee Wallet (Wallet 8) | Opening + inflows (from 2) |

**Validation:** On-chain balance at EOD UTC = Calculated expected balance.

---

## Offramp Reconciliation Checkpoints

1. **Offramp Initiation Match:** Internal request log ↔ on-chain transfer (join on Transaction ID, daily)
2. **Crypto-to-Fiat Payout Match:** On-chain transfer ↔ AptPay payout (join on Transaction ID, daily)
3. **Fee Reconciliation:** Fee amount / Gross amount = Expected fee % (daily)
4. **Daily Cycling:** Sum(2→3) for day D ≈ Sum(3→4→2) within D+1/D+2; track cumulative delta for USDC leakage
5. **Fiat Funding:** SVB debits = AptPay FBO credits

---

## Smaller Merchant Settlement Reconciliation

### Historical Process (Excel-Based)

- Workbook reconciling 19 non-Stake merchants (273 transaction weeks)
- SUMIFS formulas match settlements to correct weeks using settlement window
- Cumulative variance tracking per merchant
- 819 journal lines auto-generated
- Fiat matched via Brex Merchant Settlement Account + Primary Checking
- USDC matched via on-chain transfers to merchant wallets

### Known Issues

- Merchant name mismatches between bank and BigQuery (lookup table needed)
- Topups identified: MonkeySpins ($160k), Lucky Bits Vegas ($105k) — book as Merchant Escrow Advance or write off if churned

---

## Crypto Wallet Balance Reconciliation

### Process

For each Breeze-owned wallet, verify QBO balance = on-chain balance at period end.

### Verification Methods

1. **Polygonscan Token Balance Checker** — manual, one wallet at a time
2. **Dune Analytics** — query historical balances at specific blocks
3. **BigQuery** — if blockchain data already ingested (preferred)
4. [**Integral.xyz**](http://Integral.xyz) — subscription, difficult with high-transaction wallets

### USDC Types on Polygon

- **Native USDC:** `0x3c499c542cef5e3811e1192ce70d8cc03d5c3359`
- **Bridged USDC.e:** `0x2791bca1f2de4661ed88a30c99a7a9449aa84174`
- Check both for complete balance