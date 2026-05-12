export interface OraclePrice {
  /** Raw price value with 6-decimal precision */
  rawPrice: number;
  /** Block height when the price was last updated */
  lastUpdatedBlock: number;
}

import { MAX_PRICE_AGE_BLOCKS } from '../constants';

/** Return true if the oracle price is stale (older than MAX_PRICE_AGE_BLOCKS). */
export function isPriceStale(lastUpdatedBlock: number, currentBlock: number): boolean {
  return currentBlock - lastUpdatedBlock > MAX_PRICE_AGE_BLOCKS;
}
