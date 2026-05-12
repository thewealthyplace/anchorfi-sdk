# anchorfi-sdk

TypeScript SDK for interacting with the [AnchorFi](https://github.com/thewealthyplace/anchorfi) lending protocol on the Stacks blockchain.

AnchorFi is a Bitcoin-anchored DeFi lending protocol that lets users deposit STX as collateral and borrow aUSD (AnchorFi USD) against it.

## Installation

```bash
npm install anchorfi-sdk
```

## Quick Start

```ts
import { createAnchorFiConfig, fetchLoan, fetchHealthFactor, formatAusd, formatStx } from 'anchorfi-sdk';

const config = createAnchorFiConfig({
  network: 'mainnet',
  contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ',
});

const loan = await fetchLoan(config, 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ');
if (loan) {
  console.log('Collateral:', formatStx(loan.collateralLocked));
  console.log('Debt:', formatAusd(loan.principalAmount + loan.interestAccrued));
}

const healthFactor = await fetchHealthFactor(config, 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ');
console.log('Health factor:', healthFactor); // 800 = liquidation threshold
```

## Configuration

```ts
import { createAnchorFiConfig } from 'anchorfi-sdk';

const config = createAnchorFiConfig({
  network: 'mainnet',            // 'mainnet' | 'testnet'
  contractAddress: 'SP...',      // deployer address of the AnchorFi contracts
  // optional overrides
  lendingPoolContractName: 'lending-pool',
  collateralVaultContractName: 'collateral-vault',
  oracleContractName: 'oracle',
  ausdContractName: 'ausd-token',
  liquidationContractName: 'liquidation',
  stacksApiUrl: 'https://api.hiro.so',
});
```

## API Reference

### Lending Pool

```ts
// Fetch a borrower's active loan
fetchLoan(config, borrower): Promise<Loan | null>

// Health factor — value below 800 is liquidatable
fetchHealthFactor(config, borrower): Promise<number>

// Maximum aUSD borrowable for a given STX collateral amount
fetchMaxBorrow(config, collateralMicroStx): Promise<number>

// Total aUSD borrowed across all loans
fetchTotalBorrowed(config): Promise<number>

// Loan event history
fetchLoanEventCount(config, borrower): Promise<number>
fetchLoanEvent(config, borrower, index): Promise<LoanEvent | null>
fetchLoanEventSummary(config, borrower): Promise<LoanEventSummary | null>
fetchAllLoanEvents(config, borrower): Promise<LoanEvent[]>
```

### Collateral Vault

```ts
// Deposited / locked / available STX for an address
fetchVaultPosition(config, address): Promise<VaultPosition | null>

// Total STX held across all vaults
fetchTotalCollateral(config): Promise<number>
```

### Oracle

```ts
// Current STX/USD price (rawPrice has 6-decimal precision)
fetchOraclePrice(config): Promise<OraclePrice | null>

// Current Stacks block height
fetchBlockHeight(config): Promise<number>
```

### aUSD Token

```ts
fetchAusdBalance(config, address): Promise<number>
fetchAusdTotalSupply(config): Promise<number>
```

### Liquidation Registry

```ts
fetchLiquidationEvent(config, eventId): Promise<LiquidationEvent | null>
fetchLiquidatorStats(config, liquidator): Promise<LiquidatorStats>
fetchTotalLiquidations(config): Promise<number>
fetchRecentLiquidations(config, limit?): Promise<LiquidationEvent[]>
```

## Utilities

```ts
// Unit conversions
microToStx(micro)        // 1_000_000 → 1
stxToMicro(stx)          // 1 → 1_000_000n
microToAusd(micro)       // 1_000_000 → 1
ausdToMicro(ausd)        // 1 → 1_000_000n
rawPriceToUsd(rawPrice)  // 2_500_000 → 2.5

// Formatting
formatStx(micro)         // → "1.5 STX"
formatAusd(micro)        // → "100.00 aUSD"
formatUsdPrice(raw)      // → "$2.50"
truncateAddress(address) // → "SP2J6Z…V9EJ"

// Protocol math
stxToUsd(microStx, rawPrice)              // micro-STX → micro-aUSD
calculateMaxBorrow(collateralUsd)          // apply 70% LTV
calculateHealthFactor(collateralUsd, debt) // → per-mille ratio
isLiquidatable(healthFactor)               // true if < 800
calculateInterest(principal, blocks)       // accrue interest

// Validation
validateAddress(address) // → boolean
```

## Types

```ts
interface Loan {
  borrower: string;
  principalAmount: number;   // micro-aUSD
  interestAccrued: number;   // micro-aUSD
  collateralLocked: number;  // micro-STX
  openedAtBlock: number;
  lastAccrualBlock: number;
}

type LoanStatus = 'healthy' | 'at_risk' | 'liquidatable' | 'closed';
type LoanEventType = 'borrow' | 'repay' | 'liquidate';

interface OraclePrice {
  rawPrice: number;        // 6-decimal precision
  lastUpdatedBlock: number;
}

interface VaultPosition {
  address: string;
  deposited: number;   // micro-STX
  locked: number;      // micro-STX
  available: number;   // micro-STX
}
```

## Protocol Constants

| Constant | Value | Description |
|---|---|---|
| `LTV_RATIO` | 700 | 70% loan-to-value ratio |
| `LIQUIDATION_THRESHOLD` | 800 | 80% — positions below this are liquidatable |
| `LIQUIDATION_BONUS` | 100 | 10% bonus paid to liquidators |
| `INTEREST_RATE_PER_BLOCK` | 10 | 0.001% per block (~5% simple APR) |
| `MAX_PRICE_AGE_BLOCKS` | 144 | ~1 day before oracle price is considered stale |
| `MS_PER_BLOCK` | 600_000 | ~10 minutes per Stacks block |

## License

MIT
