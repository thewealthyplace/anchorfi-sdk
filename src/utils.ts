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
