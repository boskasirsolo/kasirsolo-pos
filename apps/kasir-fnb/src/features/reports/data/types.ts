export type ReportPeriod = "daily" | "weekly" | "monthly";

export interface FnbReportData {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalTransactions: number;
  totalItemsSold: number;
  totalDiscounts: number;
  totalTax: number;
  totalServiceCharge: number;
  netRevenue: number;
  averageTransaction: number;
  topMenuItems: { name: string; qty: number; revenue: number }[];
  orderTypeBreakdown: { type: string; count: number; total: number }[];
  paymentBreakdown: { method: string; count: number; total: number }[];
  peakHours: { hour: number; count: number; revenue: number }[];
  tableUtilization: { tableNumber: number; orders: number; revenue: number }[];
  dailyTrend: { date: string; revenue: number; count: number }[];
}
