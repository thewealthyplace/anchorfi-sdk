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
