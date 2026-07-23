/**
 * PosDailyReport represents a summarized daily business report.
 */
export interface PosDailyReport {
  /** UUID primary key */
  id: string;
  /** Report date (YYYY-MM-DD) */
  date: string;
  /** Total number of transactions */
  total_transactions: number;
  /** Number of voided transactions */
  void_transactions: number;
  /** Gross revenue (before discounts/tax) */
  gross_revenue: number;
  /** Total discounts given */
  total_discounts: number;
  /** Total tax collected */
  total_tax: number;
  /** Net revenue (after discounts, including tax) */
  net_revenue: number;
  /** Breakdown by payment method */
  payment_breakdown: PaymentBreakdown[];
  /** Top selling products */
  top_products: TopProduct[];
  /** Total items sold */
  total_items_sold: number;
  /** Average transaction value */
  average_transaction: number;
  /** Opening cash balance */
  opening_cash: number;
  /** Closing cash balance */
  closing_cash: number;
  /** Cash difference (closing - expected) */
  cash_difference: number;
  /** Report generation timestamp (ISO string) */
  created_at: string;
}

export interface PaymentBreakdown {
  method: string;
  count: number;
  total: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}
