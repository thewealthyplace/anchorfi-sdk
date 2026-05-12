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

const MAINNET_API = 'https://api.hiro.so';
const TESTNET_API = 'https://api.testnet.hiro.so';

/**
 * Build a resolved AnchorFi config from user-supplied options.
 * Pass the returned object into any SDK function that requires a config.
 */
export function createAnchorFiConfig(config: AnchorFiConfig) {
  const oracleContractName = config.oracleContractName ?? DEFAULT_ORACLE;
  const ausdContractName = config.ausdContractName ?? DEFAULT_AUSD;
  const collateralVaultContractName = config.collateralVaultContractName ?? DEFAULT_VAULT;
  const lendingPoolContractName = config.lendingPoolContractName ?? DEFAULT_POOL;
  const liquidationContractName = config.liquidationContractName ?? DEFAULT_LIQUIDATION;
  const stacksApiUrl =
    config.stacksApiUrl ?? (config.network === 'mainnet' ? MAINNET_API : TESTNET_API);

  const addr = config.contractAddress;

  return {
    network: config.network as NetworkName,
    contractAddress: addr,
    stacksApiUrl,
    oracleContractName,
    ausdContractName,
    collateralVaultContractName,
    lendingPoolContractName,
    liquidationContractName,
  };
}

export type ResolvedAnchorFiConfig = ReturnType<typeof createAnchorFiConfig>;
