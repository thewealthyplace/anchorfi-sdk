export type NetworkName = 'mainnet' | 'testnet';

export interface AnchorFiConfig {
  network: NetworkName;
  /** Deployer/owner address that deployed all AnchorFi contracts */
  contractAddress: string;
  oracleContractName?: string;
  ausdContractName?: string;
  collateralVaultContractName?: string;
  lendingPoolContractName?: string;
  liquidationContractName?: string;
  stacksApiUrl?: string;
}

const DEFAULT_ORACLE = 'oracle';
const DEFAULT_AUSD = 'ausd-token';
const DEFAULT_VAULT = 'collateral-vault';
const DEFAULT_POOL = 'lending-pool';
const DEFAULT_LIQUIDATION = 'liquidation';
