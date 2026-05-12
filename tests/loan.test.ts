import { describe, it, expect } from 'vitest';
import {
  getLoanStatus,
  parseLoanEventType,
  totalOwed,
  blocksUntilLiquidatable,
  type Loan,
} from '../src/types/loan';

const baseLoan: Loan = {
  borrower: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ',
  principalAmount: 100_000_000,
  interestAccrued: 0,
  collateralLocked: 200_000_000,
  openedAtBlock: 1000,
  lastAccrualBlock: 1000,
};

describe('totalOwed', () => {
  it('returns principal when no interest', () => {
    expect(totalOwed(baseLoan)).toBe(100_000_000);
  });

  it('sums principal and interest', () => {
    expect(totalOwed({ ...baseLoan, interestAccrued: 5_000_000 })).toBe(105_000_000);
  });
});

describe('getLoanStatus', () => {
  it('closed when health factor is 0', () => {
    expect(getLoanStatus(0)).toBe('closed');
  });

  it('liquidatable when below 800', () => {
    expect(getLoanStatus(750)).toBe('liquidatable');
  });

  it('at_risk when just above threshold', () => {
    expect(getLoanStatus(820)).toBe('at_risk');
  });

  it('healthy when well above threshold', () => {
    expect(getLoanStatus(1500)).toBe('healthy');
  });
});

describe('parseLoanEventType', () => {
  it('maps 1 to borrow', () => expect(parseLoanEventType(1)).toBe('borrow'));
  it('maps 2 to repay', () => expect(parseLoanEventType(2)).toBe('repay'));
  it('maps 3 to liquidate', () => expect(parseLoanEventType(3)).toBe('liquidate'));
});

describe('blocksUntilLiquidatable', () => {
  it('returns 0 when already liquidatable', () => {
    expect(blocksUntilLiquidatable(baseLoan, 750)).toBe(0);
  });

  it('returns null when no debt', () => {
    const noDebt = { ...baseLoan, principalAmount: 0, interestAccrued: 0 };
    expect(blocksUntilLiquidatable(noDebt, 1200)).toBeNull();
  });

  it('returns a positive block count for a healthy position', () => {
    const blocks = blocksUntilLiquidatable(baseLoan, 1400);
    expect(blocks).toBeGreaterThan(0);
  });
});
