export interface Loan {
  borrower: string;
  /** Borrowed aUSD principal, in micro-aUSD */
  principalAmount: number;
  /** Accrued interest so far, in micro-aUSD */
  interestAccrued: number;
  /** STX collateral locked in the vault, in micro-STX */
  collateralLocked: number;
  /** Block height when the loan was opened */
  openedAtBlock: number;
  /** Block height of the last interest accrual */
  lastAccrualBlock: number;
}

export type LoanEventType = 'borrow' | 'repay' | 'liquidate';

export interface LoanEvent {
  actionType: LoanEventType;
  /** Amount involved in this event, in micro-aUSD */
  actionAmount: number;
  /** Block height when the event occurred */
  actionBlock: number;
  /** Total debt remaining after this event, in micro-aUSD */
  totalDebt: number;
}

export interface LoanEventSummary {
  eventCount: number;
  lastEvent: LoanEvent;
}

export type LoanStatus = 'healthy' | 'at_risk' | 'liquidatable' | 'closed';

import { LIQUIDATION_THRESHOLD, RATIO_PRECISION } from '../constants';

/**
 * Derive the health status of a loan from its health factor.
 * The health factor is the raw value from the contract (collateral_usd / total_owed * 1000).
 */
export function getLoanStatus(healthFactor: number): LoanStatus {
  if (healthFactor === 0) return 'closed';
  if (healthFactor < LIQUIDATION_THRESHOLD) return 'liquidatable';
  if (healthFactor < LIQUIDATION_THRESHOLD + 50) return 'at_risk';
  return 'healthy';
}

/** Compute total debt (principal + accrued interest) for a loan, in micro-aUSD. */
export function totalOwed(loan: Loan): number {
  return loan.principalAmount + loan.interestAccrued;
}

/** Map the uint action-type from the contract to a readable string. */
export function parseLoanEventType(raw: number): LoanEventType {
  if (raw === 1) return 'borrow';
  if (raw === 2) return 'repay';
  return 'liquidate';
}

/** Estimate blocks until an undercollateralised loan hits the liquidation threshold. Returns null if healthy or no debt. */
export function blocksUntilLiquidatable(
  loan: Loan,
  currentHealthFactor: number,
): number | null {
  if (currentHealthFactor < LIQUIDATION_THRESHOLD) return 0;
  if (loan.principalAmount === 0) return null;

  const INTEREST_RATE_PER_BLOCK = 10;
  const INTEREST_PRECISION = 1_000_000;
  const collateralUsd = (currentHealthFactor * totalOwed(loan)) / RATIO_PRECISION;
  const debtAtThreshold = (collateralUsd * RATIO_PRECISION) / LIQUIDATION_THRESHOLD;
  const interestNeeded = debtAtThreshold - totalOwed(loan);
  if (interestNeeded <= 0) return 0;

  return Math.ceil(
    (interestNeeded * INTEREST_PRECISION) / (loan.principalAmount * INTEREST_RATE_PER_BLOCK),
  );
}
