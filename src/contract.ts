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

/** Fetch the total STX collateral held in the vault (in micro-STX). */
export async function fetchTotalCollateral(config: ResolvedAnchorFiConfig): Promise<number> {
  try {
    const result = await readOnly(
      config,
      config.collateralVaultContractName,
      'get-total-collateral',
      [],
    );
    const json = cvToJSON(result);
    return Number(json.value?.value ?? 0);
  } catch {
    return 0;
  }
}

import type { OraclePrice } from './types/oracle';

/**
 * Fetch the current STX/USD price from the oracle.
 * Returns null if the price is stale or the oracle is not yet initialised.
 */
export async function fetchOraclePrice(
  config: ResolvedAnchorFiConfig,
): Promise<OraclePrice | null> {
  try {
    const [priceResult, updatedResult] = await Promise.all([
      readOnly(config, config.oracleContractName, 'get-price-unsafe', []),
      readOnly(config, config.oracleContractName, 'get-last-updated', []),
    ]);

    const rawPrice = Number(cvToJSON(priceResult).value?.value ?? 0);
    const lastUpdatedBlock = Number(cvToJSON(updatedResult).value?.value ?? 0);

    if (rawPrice === 0) return null;
    return { rawPrice, lastUpdatedBlock };
  } catch {
    return null;
  }
}

/** Fetch the current Stacks block height from the API. */
export async function fetchBlockHeight(config: ResolvedAnchorFiConfig): Promise<number> {
  try {
    const res = await fetch(`${config.stacksApiUrl}/v2/info`);
    const data = await res.json();
    return Number(data.burn_block_height ?? data.stacks_tip_height ?? 0);
  } catch {
    return 0;
  }
}

/** Fetch the aUSD balance of a given address (in micro-aUSD). */
export async function fetchAusdBalance(
  config: ResolvedAnchorFiConfig,
  address: string,
): Promise<number> {
  try {
    const result = await readOnly(
      config,
      config.ausdContractName,
      'get-balance',
      [standardPrincipalCV(address)],
    );
    const json = cvToJSON(result);
    return Number(json.value?.value ?? 0);
  } catch {
    return 0;
  }
}

/** Fetch the total aUSD supply in circulation (in micro-aUSD). */
export async function fetchAusdTotalSupply(config: ResolvedAnchorFiConfig): Promise<number> {
  try {
    const result = await readOnly(
      config,
      config.ausdContractName,
      'get-total-supply',
      [],
    );
    const json = cvToJSON(result);
    return Number(json.value?.value ?? 0);
  } catch {
    return 0;
  }
}

import type { LiquidationEvent, LiquidatorStats } from './types/liquidation';

/** Fetch a single liquidation event by its ID. Returns null if not found. */
export async function fetchLiquidationEvent(
  config: ResolvedAnchorFiConfig,
  eventId: number,
): Promise<LiquidationEvent | null> {
  try {
    const result = await readOnly(
      config,
      config.liquidationContractName,
      'get-liquidation-event',
      [uintCV(eventId)],
    );
    const json = cvToJSON(result);
    const v = json.value?.value;
    if (!v) return null;

    return {
      eventId,
      liquidator: v['liquidator']?.value ?? '',
      borrower: v['borrower']?.value ?? '',
      debtRepaid: Number(v['debt-repaid']?.value ?? 0),
      collateralSeized: Number(v['collateral-seized']?.value ?? 0),
      blockHeight: Number(v['block-height']?.value ?? 0),
    };
  } catch {
    return null;
  }
}

/** Fetch statistics for a liquidator address. */
export async function fetchLiquidatorStats(
  config: ResolvedAnchorFiConfig,
  liquidator: string,
): Promise<LiquidatorStats> {
  try {
    const result = await readOnly(
      config,
      config.liquidationContractName,
      'get-liquidator-stats',
      [standardPrincipalCV(liquidator)],
    );
    const json = cvToJSON(result);
    const v = json.value?.value;
    if (!v) return { totalLiquidations: 0, totalProfit: 0 };

    return {
      totalLiquidations: Number(v['total-liquidations']?.value ?? 0),
      totalProfit: Number(v['total-profit']?.value ?? 0),
    };
  } catch {
    return { totalLiquidations: 0, totalProfit: 0 };
  }
}

/** Fetch the total number of liquidation events recorded on-chain. */
export async function fetchTotalLiquidations(config: ResolvedAnchorFiConfig): Promise<number> {
  try {
    const result = await readOnly(
      config,
      config.liquidationContractName,
      'get-total-liquidations',
      [],
    );
    const json = cvToJSON(result);
    return Number(json.value?.value ?? 0);
  } catch {
    return 0;
  }
}

/**
 * Fetch the most recent N liquidation events (newest first).
 * @param limit  Maximum number of events to return (default 20)
 */
export async function fetchRecentLiquidations(
  config: ResolvedAnchorFiConfig,
  limit = 20,
): Promise<LiquidationEvent[]> {
  const total = await fetchTotalLiquidations(config);
  if (total === 0) return [];

  const start = Math.max(0, total - limit);
  const ids = Array.from({ length: total - start }, (_, i) => total - 1 - i);

  const results = await Promise.all(ids.map((id) => fetchLiquidationEvent(config, id)));
  return results.filter((e): e is LiquidationEvent => e !== null);
}
