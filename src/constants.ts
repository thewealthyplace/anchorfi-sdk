/** Loan-to-value ratio — 70% expressed as per-mille (out of 1000) */
export const LTV_RATIO = 700;

/** Liquidation threshold — 80% expressed as per-mille */
export const LIQUIDATION_THRESHOLD = 800;

/** Liquidation bonus — 10% expressed as per-mille */
export const LIQUIDATION_BONUS = 100;

/** Denominator for ratio calculations */
export const RATIO_PRECISION = 1_000;

/** Per-block interest rate: 10 / 1_000_000 = 0.001% per block (~5% APR) */
export const INTEREST_RATE_PER_BLOCK = 10;

/** Precision divisor for interest calculations */
export const INTEREST_PRECISION = 1_000_000;

/** Decimal precision used by the oracle price feed (6 decimal places) */
export const PRICE_PRECISION = 1_000_000;

/** Maximum acceptable age of an oracle price update, in Stacks blocks (~1 day) */
export const MAX_PRICE_AGE_BLOCKS = 144;

/** Milliseconds per Stacks block (~10 minutes, anchored to Bitcoin) */
export const MS_PER_BLOCK = 10 * 60 * 1_000;

/** Minimum collateral deposit accepted by the vault, in micro-STX */
export const MIN_COLLATERAL_MICRO_STX = 1_000_000;

/** aUSD token decimal places */
export const AUSD_DECIMALS = 6;
