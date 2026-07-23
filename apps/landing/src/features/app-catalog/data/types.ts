export interface AppItem {
  id: string;
  slug: string;
  name: string;
  icon: string;
  price: number;
  priceFormatted: string;
  category: 'bisnis' | 'institusi' | 'kesehatan';
  categoryLabel: string;
  hot?: boolean;
  description: string;
  features: string[];
}
