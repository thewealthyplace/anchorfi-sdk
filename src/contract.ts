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
