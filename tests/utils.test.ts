import { describe, it, expect } from 'vitest';
import {
  microToStx,
  stxToMicro,
  microToAusd,
  ausdToMicro,
  rawPriceToUsd,
  formatStx,
  formatAusd,
  formatUsdPrice,
  truncateAddress,
  stxToUsd,
  calculateMaxBorrow,
  calculateHealthFactor,
  isLiquidatable,
  calculateInterest,
  validateAddress,
} from '../src/utils';

describe('unit conversions', () => {
  it('microToStx', () => {
    expect(microToStx(1_000_000)).toBe(1);
    expect(microToStx(1_500_000)).toBe(1.5);
    expect(microToStx(0)).toBe(0);
  });

  it('stxToMicro', () => {
    expect(stxToMicro(1)).toBe(1_000_000n);
    expect(stxToMicro(0.5)).toBe(500_000n);
  });

  it('microToAusd', () => {
    expect(microToAusd(2_000_000)).toBe(2);
    expect(microToAusd(500_000)).toBe(0.5);
  });

  it('ausdToMicro', () => {
    expect(ausdToMicro(1)).toBe(1_000_000n);
    expect(ausdToMicro(100)).toBe(100_000_000n);
  });

  it('rawPriceToUsd', () => {
    expect(rawPriceToUsd(2_500_000)).toBe(2.5);
    expect(rawPriceToUsd(1_000_000)).toBe(1);
  });
});

describe('formatting', () => {
  it('formatStx', () => {
    expect(formatStx(1_000_000)).toBe('1 STX');
    expect(formatStx(1_500_000)).toBe('1.5 STX');
  });

  it('formatAusd', () => {
    expect(formatAusd(100_000_000)).toBe('100.00 aUSD');
    expect(formatAusd(500_000)).toBe('0.50 aUSD');
  });

  it('formatUsdPrice', () => {
    expect(formatUsdPrice(2_500_000)).toBe('$2.50');
  });

  it('truncateAddress', () => {
    const addr = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ';
    const truncated = truncateAddress(addr);
    expect(truncated).toContain('…');
    expect(truncated.length).toBeLessThan(addr.length);
  });

  it('does not truncate short addresses', () => {
    expect(truncateAddress('SP123')).toBe('SP123');
  });
});

describe('protocol math', () => {
  it('stxToUsd', () => {
    // 1 STX (1_000_000 microSTX) at $2.50 (2_500_000 rawPrice) = $2.50 (2_500_000 micro-aUSD)
    expect(stxToUsd(1_000_000, 2_500_000)).toBe(2_500_000);
  });

  it('calculateMaxBorrow — 70% LTV', () => {
    // $100 collateral → max $70 borrow
    expect(calculateMaxBorrow(100_000_000)).toBe(70_000_000);
  });

  it('calculateHealthFactor', () => {
    // collateral $1000, debt $500 → hf = 1000 * 1000 / 500 = 2000
    expect(calculateHealthFactor(1_000_000_000, 500_000_000)).toBe(2000);
  });

  it('calculateHealthFactor returns 0 when no debt', () => {
    expect(calculateHealthFactor(1_000_000, 0)).toBe(0);
  });

  it('isLiquidatable — below threshold', () => {
    expect(isLiquidatable(750)).toBe(true);
  });

  it('isLiquidatable — healthy', () => {
    expect(isLiquidatable(1200)).toBe(false);
  });

  it('isLiquidatable — exactly at threshold is safe', () => {
    expect(isLiquidatable(800)).toBe(false);
  });

  it('isLiquidatable — 0 health factor (no loan)', () => {
    expect(isLiquidatable(0)).toBe(false);
  });

  it('calculateInterest', () => {
    // 100 aUSD, 1000 blocks → 100_000_000 * 10 * 1000 / 1_000_000 = 1_000_000 (1 aUSD)
    expect(calculateInterest(100_000_000, 1000)).toBe(1_000_000);
  });
});

describe('validateAddress', () => {
  it('accepts valid mainnet address', () => {
    expect(validateAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBe(true);
  });

  it('accepts valid testnet address', () => {
    expect(validateAddress('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG')).toBe(true);
  });

  it('accepts contract principal', () => {
    expect(validateAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ.lending-pool')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validateAddress('')).toBe(false);
  });

  it('rejects invalid prefix', () => {
    expect(validateAddress('AB2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBe(false);
  });
});
