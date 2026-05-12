import { describe, it, expect } from 'vitest';
import {
  LTV_RATIO,
  LIQUIDATION_THRESHOLD,
  LIQUIDATION_BONUS,
  RATIO_PRECISION,
  INTEREST_RATE_PER_BLOCK,
  INTEREST_PRECISION,
  PRICE_PRECISION,
  MAX_PRICE_AGE_BLOCKS,
  MS_PER_BLOCK,
  AUSD_DECIMALS,
} from '../src/constants';

describe('protocol constants match on-chain values', () => {
  it('LTV ratio is 70%', () => {
    expect(LTV_RATIO / RATIO_PRECISION).toBeCloseTo(0.7);
  });

  it('liquidation threshold is 80%', () => {
    expect(LIQUIDATION_THRESHOLD / RATIO_PRECISION).toBeCloseTo(0.8);
  });

  it('liquidation bonus is 10%', () => {
    expect(LIQUIDATION_BONUS / RATIO_PRECISION).toBeCloseTo(0.1);
  });

  it('interest rate gives ~5% APR', () => {
    const blocksPerYear = 52_560;
    const apr = (INTEREST_RATE_PER_BLOCK * blocksPerYear) / INTEREST_PRECISION;
    expect(apr).toBeCloseTo(0.5256, 3);
  });

  it('price precision is 6 decimals', () => {
    expect(PRICE_PRECISION).toBe(1_000_000);
  });

  it('max price age is ~1 day', () => {
    const msPerDay = 24 * 60 * 60 * 1_000;
    expect(MAX_PRICE_AGE_BLOCKS * MS_PER_BLOCK).toBeCloseTo(msPerDay, -4);
  });

  it('aUSD has 6 decimal places', () => {
    expect(AUSD_DECIMALS).toBe(6);
  });
});
