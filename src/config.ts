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
