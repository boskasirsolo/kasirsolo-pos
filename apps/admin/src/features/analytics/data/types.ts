export interface AnalyticsData {
  revenue: MonthlyRevenue[];
  conversionRate: number;
  trialToActiveRate: number;
  avgRevenuePerClient: number;
  totalRevenue: number;
  appMix: AppMixItem[];
  clientGrowth: GrowthPoint[];
  topSources: SourceItem[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  count: number;
}

export interface AppMixItem {
  appName: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface GrowthPoint {
  month: string;
  clients: number;
  trials: number;
}

export interface SourceItem {
  source: string;
  count: number;
  percentage: number;
}
