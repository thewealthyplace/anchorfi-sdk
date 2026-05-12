export interface OraclePrice {
  /** Raw price value with 6-decimal precision */
  rawPrice: number;
  /** Block height when the price was last updated */
  lastUpdatedBlock: number;
}
