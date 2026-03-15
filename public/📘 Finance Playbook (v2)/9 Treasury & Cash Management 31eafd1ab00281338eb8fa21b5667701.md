# 9. Treasury & Cash Management

## Recurring Treasury Operations

### Weekly/Biweekly Tasks

| Task | Frequency | Day |
| --- | --- | --- |
| Top up APT for payouts | Weekly | Friday |
| Transfer from main account to Working Payables (WP) | Weekly | Friday |
| EUR/USD conversion (when extracting) | As needed | — |
| Top up AptPay weekend buffer | Weekly | Friday |
| AptPay liquidity check (confirm no manual top-ups needed) | Daily | — |
| Profit extraction (sweep profit to Breeze bank) | Biweekly | — |

### APT Top-Up Process

Every Friday, ensure APT has sufficient float for the following week’s fiat payouts. Check APT balance → calculate expected outflows → fund from SVB.

### AptPay Weekend Buffer (Friday)

Every Friday, top up AptPay with enough float to cover Saturday and Sunday payouts. Weekend payouts process automatically but there’s no manual intervention available, so the buffer must be pre-funded before EOD Friday.

### AptPay Daily Liquidity Check

Check AptPay balance daily to confirm the current float is sufficient for expected outflows. If balance is running low or a large payout batch is expected, trigger a manual top-up from SVB. The goal is to avoid any interruption to user payouts.

### Profit Extraction

Periodically sweep accumulated processing profit from operational accounts into Breeze’s main bank account. Frequency depends on cash position and upcoming obligations.

---

## Bank Accounts Registry

| Entity | Bank | Purpose |
| --- | --- | --- |
| Breeze Payment Inc (US) | Mercury | Main operating account |
| Breeze Payment Inc (US) | SVB | RTP payouts, APT funding |
| Breeze Payment Inc (US) | Brex | Merchant Settlement + Primary Checking |
| Breeze Labs Pte Ltd (SG) | DBS | Singapore operations |

---

## USDC Wallets (Polygon)

| Short | Full Address | Use Case |
| --- | --- | --- |
| 47c0 | `0x521aCe5E7e97d89894fd3240E3cb5D3D5f6A47c0` | Payout Fee Wallet |
| 31a0 | `0xa4c87044DA286fbA4cf490723E209199e55731a0` | Polygon Payin Treasury |
| 2bbf | — | USDC Cycling Wallet |

### Unknown Wallets (Need Dev Identification)

1bd4, 308f, 69af, 658a, 6b5b, 00b8 — likely intermediate or merchant-specific.

### Multi-Chain Portfolio

Treasury positions across Ethereum, Polygon, Arbitrum, BSC, Avalanche, Optimism, Solana. Total portfolio ~$267k–$309k.

---

## Liquidity Monitoring

### Dashboard Design (Planned)

Real-time visibility into:

- USDC Treasury balance
- Amount in flight in the payout cycle
- SVB balance available for Treasury funding
- APT float remaining
- 7-day rolling averages and projections

### Settlement Buffer

- Weekly settlement requires ~$17M buffer
- Daily settlement (future state) reduces to stable ~$10M

---

## Multi-Entity Cash Management

- **US entity (Breeze Payment Inc):** Mercury, SVB, Brex
- **Singapore entity (Breeze Labs Pte Ltd):** DBS
- Cash position reports compiled at month-end covering both entities