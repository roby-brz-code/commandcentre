# 5. Settlement Operations

## Daily Settlement Operations

### Current Process

Settlements are moving to a daily cadence. Use Peng’s dashboard to execute USDC settlements and SVB for fiat transfers.

### Daily Workflow

1. Check Peng’s settlement dashboard for amounts due
2. Execute USDC transfers (Peng)
3. Execute SVB fiat transfers (Roby)
4. Confirm completion and notify merchants

### Merchant Bank Account Registry

> ⚠️ **Needs to be built.** Must record and maintain settlement bank account details for all merchants. Currently tracked informally.
> 

Required fields: Merchant name, merchant ID, settlement type (USDC/fiat), wallet address or bank account details, settlement frequency, contact for settlement queries.

---

## Weekly Settlement Process (Legacy/Smaller Merchants)

### Settlement Timeline

| Day | Action |
| --- | --- |
| Sunday–Monday | Settlement amounts calculated in Sigma dashboard |
| Monday | Export sent to Peng and Millie for confirmation via Slack |
| Tuesday | All amounts locked and confirmed |
| Tuesday EOD | Millie purchases required USDC |
| Wednesday | Peng processes USDC transfers; Roby processes fiat settlements |
| Wednesday | Roby notifies merchants that settlements are complete |

### Merchants

- **Stake:** 99% of volume (~$35M/week)
- **Smaller merchants:** MonkeySpins, Emberfund, PickemSocial, AtlasV, LuckyBitsVegas, Moonmate Master, Legends of Mushrooms, Legends of Elements, and others
- **Settlement types:** USDC (most merchants) and fiat (Brex-based)

### Settlement Accounting

```
Dr: Merchant Funds Payable     [settlement amount]
    Cr: USDC Wallet / Bank     [settlement amount]
```

When settling from Payout Fee Wallet (47c0) for operational convenience:

```
Dr: Merchant Funds Payable     [amount]
    Cr: Payout Fee Wallet      [amount]
```

### Topups vs Settlements

- If USDC sent > Expected Settlement → excess is a **topup** (Merchant Escrow Advance asset)
- If USDC sent ≤ Expected Settlement → all USDC is settlement

```
Dr: MFP                    [min(USDC Sent, Expected Settlement)]
Dr: Escrow Advance          [max(0, USDC Sent - Expected Settlement)]
    Cr: USDC Wallet         [Total USDC Sent]
```

### Monthly: Small Balance Rollup Review

Merchants with weekly settlement amounts under $1,000 have their balances rolled up and settled on the first Wednesday of the following month.

---

## Daily Settlement (Future State)

### Concept

Moving from weekly to daily settlement to reduce required buffer from ~$17M to stable ~$10M.

### Big Bang Migration Plan

1. Pre-launch: All wallets configured, dashboard deployed, recon automated, monitoring configured
2. Testing: Fund test Treasury with $500K from Breeze cash, run synthetic transactions through full cycle
3. Financial prep: One-time adhoc settlement to Stake ($22.86M) to reset payout balance
4. Go-live: Purchase $35M USDC, switch over all flows, disable old OTC process
5. Daily execution: Calculate settlement → Treasury → Stake Payout → CoinMe → User Payouts → USDC return

---

## Offramp Fund Flow Architecture

### Two Parallel Tracks

**Crypto Side (On-Chain Polygon):**

| Step | From | To | Description |
| --- | --- | --- | --- |
| Offramp trigger | Wallet 2 (Stake Escrow) | Wallet 3 (Coinme Custodial) | USDC transfer on user request |
| Fee deduction | Wallet 2 | Wallet 8 (Fee Wallet) | Separate fee per offramp |
| Daily cycling | Wallet 3 | Wallet 4 (Cycling) | Batched daily |
| Recycle | Wallet 4 | Wallet 2 | Returns USDC to escrow |

**Fiat Side:**

| Step | From | To | Description |
| --- | --- | --- | --- |
| Funding | Wallet 1 (SVB RTP via CKO) | Wallet 5 (AptPay FBO) | Immediate |
| User payout | Wallet 5 | Wallet 6 (AptPay Submerchant) | Triggered by crypto confirmation |
| Final payout | Wallet 6 | User Bank/Debit | Via AptPay |