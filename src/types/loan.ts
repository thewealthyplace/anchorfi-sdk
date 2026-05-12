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
