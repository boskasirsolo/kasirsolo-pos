export interface TransactionFilter {
  startDate: string | null;
  endDate: string | null;
  paymentMethod: string | null;
  search: string;
}

export const INITIAL_FILTER: TransactionFilter = {
  startDate: null,
  endDate: null,
  paymentMethod: null,
  search: "",
};
