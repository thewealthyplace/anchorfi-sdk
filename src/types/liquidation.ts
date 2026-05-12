export interface LiquidationEvent {
  eventId: number;
  liquidator: string;
  borrower: string;
  /** Debt repaid by the liquidator, in micro-aUSD */
  debtRepaid: number;
  /** STX collateral seized by the liquidator, in micro-STX */
  collateralSeized: number;
  /** Block height when the liquidation occurred */
  blockHeight: number;
}

export interface LiquidatorStats {
  totalLiquidations: number;
  /** Total profit accumulated from liquidation bonuses, in micro-STX */
  totalProfit: number;
}
