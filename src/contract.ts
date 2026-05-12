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

/**
 * Fetch a summary of a borrower's loan activity.
 * Returns null if the borrower has no recorded events.
 */
export async function fetchLoanEventSummary(
  config: ResolvedAnchorFiConfig,
  borrower: string,
): Promise<LoanEventSummary | null> {
  try {
    const result = await readOnly(
      config,
      config.lendingPoolContractName,
      'get-loan-event-summary',
      [standardPrincipalCV(borrower)],
    );
    const json = cvToJSON(result);
    const v = json.value?.value;
    if (!v) return null;

    const last = v['last-event']?.value;
    if (!last) return null;

    return {
      eventCount: Number(v['event-count']?.value ?? 0),
      lastEvent: {
        actionType: parseLoanEventType(Number(last['action-type']?.value ?? 0)),
        actionAmount: Number(last['action-amount']?.value ?? 0),
        actionBlock: Number(last['action-block']?.value ?? 0),
        totalDebt: Number(last['total-debt']?.value ?? 0),
      },
    };
  } catch {
    return null;
  }
}

/**
 * Fetch all loan events for a borrower in order.
 * @param concurrency  Max parallel requests (default 5)
 */
export async function fetchAllLoanEvents(
  config: ResolvedAnchorFiConfig,
  borrower: string,
  concurrency = 5,
): Promise<LoanEvent[]> {
  const count = await fetchLoanEventCount(config, borrower);
  if (count === 0) return [];

  const tasks = Array.from({ length: count }, (_, i) => () =>
    fetchLoanEvent(config, borrower, i),
  );

  const results = await withConcurrency(tasks, concurrency);
  return results.filter((e): e is LoanEvent => e !== null);
}

export interface VaultPosition {
  address: string;
  /** Total deposited micro-STX */
  deposited: number;
  /** Locked collateral, in micro-STX */
  locked: number;
  /** Available (free) collateral, in micro-STX */
  available: number;
}

/** Fetch the collateral vault position for a Stacks address. Returns null if none exists. */
export async function fetchVaultPosition(
  config: ResolvedAnchorFiConfig,
  address: string,
): Promise<VaultPosition | null> {
  try {
    const result = await readOnly(
      config,
      config.collateralVaultContractName,
      'get-vault',
      [standardPrincipalCV(address)],
    );
    const json = cvToJSON(result);
    const v = json.value?.value;
    if (!v) return null;

    const deposited = Number(v['deposited']?.value ?? 0);
    const locked = Number(v['locked']?.value ?? 0);

    return { address, deposited, locked, available: deposited - locked };
  } catch {
    return null;
  }
}
