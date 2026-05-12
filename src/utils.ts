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
