import { callReadOnlyFunction, cvToJSON, uintCV, standardPrincipalCV } from '@stacks/transactions';
import type { ResolvedAnchorFiConfig } from './config';

async function readOnly(
  config: ResolvedAnchorFiConfig,
  contractName: string,
  functionName: string,
  functionArgs: unknown[],
) {
  return callReadOnlyFunction({
    network: config.network,
    contractAddress: config.contractAddress,
    contractName,
    functionName,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    functionArgs: functionArgs as any[],
    senderAddress: config.contractAddress,
  });
}

import type { Loan } from './types/loan';
import { parseLoanEventType } from './types/loan';

/** Fetch the active loan for a borrower. Returns null if they have no loan. */
export async function fetchLoan(
  config: ResolvedAnchorFiConfig,
  borrower: string,
): Promise<Loan | null> {
  try {
    const result = await readOnly(
      config,
      config.lendingPoolContractName,
      'get-loan',
      [standardPrincipalCV(borrower)],
    );
    const json = cvToJSON(result);
    const v = json.value?.value;
    if (!v) return null;

    return {
      borrower,
      principalAmount: Number(v['principal-amount']?.value ?? 0),
      interestAccrued: Number(v['interest-accrued']?.value ?? 0),
      collateralLocked: Number(v['collateral-locked']?.value ?? 0),
      openedAtBlock: Number(v['opened-at-block']?.value ?? 0),
      lastAccrualBlock: Number(v['last-accrual-block']?.value ?? 0),
    };
  } catch {
    return null;
  }
}

/**
 * Fetch the health factor for a borrower's loan.
 * Returns 0 if the borrower has no loan. Raw value is (collateral_usd / total_owed) * 1000.
 * A value below 800 means the position is liquidatable.
 */
export async function fetchHealthFactor(
  config: ResolvedAnchorFiConfig,
  borrower: string,
): Promise<number> {
  try {
    const result = await readOnly(
      config,
      config.lendingPoolContractName,
      'get-health-factor',
      [standardPrincipalCV(borrower)],
    );
    const json = cvToJSON(result);
    return Number(json.value?.value ?? 0);
  } catch {
    return 0;
  }
}

/** Fetch the total aUSD borrowed across all loans (in micro-aUSD). */
export async function fetchTotalBorrowed(config: ResolvedAnchorFiConfig): Promise<number> {
  try {
    const result = await readOnly(
      config,
      config.lendingPoolContractName,
      'get-total-borrowed',
      [],
    );
    const json = cvToJSON(result);
    return Number(json.value?.value ?? 0);
  } catch {
    return 0;
  }
}

/**
 * Calculate the maximum aUSD that can be borrowed against a given STX collateral amount.
 * @param collateralMicroStx  Collateral in micro-STX
 */
export async function fetchMaxBorrow(
  config: ResolvedAnchorFiConfig,
  collateralMicroStx: number,
): Promise<number> {
  try {
    const result = await readOnly(
      config,
      config.lendingPoolContractName,
      'get-max-borrow',
      [uintCV(collateralMicroStx)],
    );
    const json = cvToJSON(result);
    return Number(json.value?.value ?? 0);
  } catch {
    return 0;
  }
}

import type { LoanEvent, LoanEventSummary } from './types/loan';

/** Fetch the total number of loan events recorded for a borrower. */
export async function fetchLoanEventCount(
  config: ResolvedAnchorFiConfig,
  borrower: string,
): Promise<number> {
  try {
    const result = await readOnly(
      config,
      config.lendingPoolContractName,
      'get-loan-event-count',
      [standardPrincipalCV(borrower)],
    );
    const json = cvToJSON(result);
    return Number(json.value?.value ?? 0);
  } catch {
    return 0;
  }
}

/** Fetch a specific loan event by its index. Returns null if not found. */
export async function fetchLoanEvent(
  config: ResolvedAnchorFiConfig,
  borrower: string,
  index: number,
): Promise<LoanEvent | null> {
  try {
    const result = await readOnly(
      config,
      config.lendingPoolContractName,
      'get-loan-event',
      [standardPrincipalCV(borrower), uintCV(index)],
    );
    const json = cvToJSON(result);
    const v = json.value?.value;
    if (!v) return null;

    return {
      actionType: parseLoanEventType(Number(v['action-type']?.value ?? 0)),
      actionAmount: Number(v['action-amount']?.value ?? 0),
      actionBlock: Number(v['action-block']?.value ?? 0),
      totalDebt: Number(v['total-debt']?.value ?? 0),
    };
  } catch {
    return null;
  }
}
