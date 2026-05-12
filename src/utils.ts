import {
  INTEREST_PRECISION,
  INTEREST_RATE_PER_BLOCK,
  LTV_RATIO,
  PRICE_PRECISION,
  RATIO_PRECISION,
} from './constants';

/** Convert micro-STX to STX (1 STX = 1_000_000 micro-STX). */
export function microToStx(micro: number | bigint): number {
  return Number(micro) / 1_000_000;
}

/** Convert STX to micro-STX. */
export function stxToMicro(stx: number): bigint {
  return BigInt(Math.round(stx * 1_000_000));
}

/** Convert micro-aUSD to aUSD (same 6-decimal precision as STX). */
export function microToAusd(micro: number | bigint): number {
  return Number(micro) / 1_000_000;
}

/** Convert aUSD to micro-aUSD. */
export function ausdToMicro(ausd: number): bigint {
  return BigInt(Math.round(ausd * 1_000_000));
}

/** Convert a raw oracle price to a human-readable USD value (e.g. 2_500_000 → 2.50). */
export function rawPriceToUsd(rawPrice: number): number {
  return rawPrice / PRICE_PRECISION;
}

/** Format a micro-STX amount as a human-readable string, e.g. "1.5 STX". */
export function formatStx(micro: number | bigint, decimals = 6): string {
  const stx = microToStx(micro);
  return `${parseFloat(stx.toFixed(decimals))} STX`;
}

/** Format a micro-aUSD amount as a human-readable string, e.g. "100.00 aUSD". */
export function formatAusd(micro: number | bigint, decimals = 2): string {
  const ausd = microToAusd(micro);
  return `${ausd.toFixed(decimals)} aUSD`;
}

/** Format a raw oracle price as a USD string, e.g. 2_500_000 → "$2.50". */
export function formatUsdPrice(rawPrice: number, decimals = 2): string {
  return `$${rawPriceToUsd(rawPrice).toFixed(decimals)}`;
}

/**
 * Truncate a Stacks principal address for display.
 * e.g. "SP2J6Z…V9EJ"
 */
export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

/**
 * Validate a Stacks principal address (standard or contract).
 * Accepts mainnet (SP, SM) and testnet (ST, SN) prefixes.
 */
export function validateAddress(address: string): boolean {
  if (typeof address !== 'string' || address.length === 0) return false;

  const principal = address.split('.')[0];
  const VALID_PREFIXES = ['SP', 'SM', 'ST', 'SN'];
  if (!VALID_PREFIXES.some((prefix) => principal.startsWith(prefix))) return false;

  const body = principal.slice(2);
  const BASE58_RE = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{20,50}$/;
  return BASE58_RE.test(body);
}

/**
 * Convert a micro-STX amount to micro-aUSD using an oracle price.
 * @param microStx   Amount in micro-STX
 * @param rawPrice   Oracle price (6-decimal precision)
 */
export function stxToUsd(microStx: number | bigint, rawPrice: number): number {
  return Math.floor((Number(microStx) * rawPrice) / PRICE_PRECISION);
}

/**
 * Calculate the maximum aUSD that can be borrowed against collateral.
 * Applies the 70% LTV ratio.
 */
export function calculateMaxBorrow(collateralUsd: number): number {
  return Math.floor((collateralUsd * LTV_RATIO) / RATIO_PRECISION);
}

/**
 * Compute the health factor for a position.
 * Returns 0 when there is no debt (the position is closed).
 */
export function calculateHealthFactor(collateralUsd: number, totalOwed: number): number {
  if (totalOwed === 0) return 0;
  return Math.floor((collateralUsd * RATIO_PRECISION) / totalOwed);
}

/** Return true if a position's health factor is below the liquidation threshold (800). */
export function isLiquidatable(healthFactor: number): boolean {
  const LIQUIDATION_THRESHOLD = 800;
  return healthFactor > 0 && healthFactor < LIQUIDATION_THRESHOLD;
}

/**
 * Estimate the interest that will accrue over a number of blocks.
 * @param principalMicroAusd  Loan principal in micro-aUSD
 * @param blocksElapsed       Number of Stacks blocks
 */
export function calculateInterest(principalMicroAusd: number, blocksElapsed: number): number {
  return Math.floor(
    (principalMicroAusd * INTEREST_RATE_PER_BLOCK * blocksElapsed) / INTEREST_PRECISION,
  );
}
