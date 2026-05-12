export interface OraclePrice {
  /** Raw price value with 6-decimal precision */
  rawPrice: number;
  /** Block height when the price was last updated */
  lastUpdatedBlock: number;
}

import { MAX_PRICE_AGE_BLOCKS, MS_PER_BLOCK } from '../constants';

/** Return true if the oracle price is stale (older than MAX_PRICE_AGE_BLOCKS). */
export function isPriceStale(lastUpdatedBlock: number, currentBlock: number): boolean {
  return currentBlock - lastUpdatedBlock > MAX_PRICE_AGE_BLOCKS;
}

/** Estimate wall-clock milliseconds since the price was last updated. */
export function msSincePriceUpdate(lastUpdatedBlock: number, currentBlock: number): number {
  return Math.max(0, currentBlock - lastUpdatedBlock) * MS_PER_BLOCK;
}
