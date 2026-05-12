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

import { LIQUIDATION_THRESHOLD } from '../constants';

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
