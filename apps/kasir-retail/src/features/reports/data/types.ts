export type ReportPeriod = "daily" | "weekly" | "monthly";

export interface ReportData {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalTransactions: number;
  totalItemsSold: number;
  totalDiscounts: number;
  totalTax: number;
  netRevenue: number;
  averageTransaction: number;
  topProducts: { name: string; qty: number; revenue: number }[];
  paymentBreakdown: { method: string; count: number; total: number }[];
  dailyTrend: { date: string; revenue: number; count: number }[];
}
