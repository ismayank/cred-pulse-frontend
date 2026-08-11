export interface Transaction {
  id: string;
  timestamp: string;
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | string;
  payment_method: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface TransactionsResponse {
  data: Transaction[];
  pagination: PaginationMeta;
  available_categories: string[];
  available_statuses: string[];
  available_payment_methods: string[];
}

export interface CategoryBreakdownItem {
  category: string;
  total_amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrendItem {
  month: string;
  total_amount: number;
  count: number;
  success_count: number;
}

export interface OverallStats {
  total_spent: number;
  total_transactions: number;
  success_rate: number;
  avg_transaction: number;
}

export interface AnalyticsResponse {
  category_breakdown: CategoryBreakdownItem[];
  monthly_trend: MonthlyTrendItem[];
  overall_stats: OverallStats;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost_coins: number;
  category: string;
  image_url: string;
  discount_value: string;
  code_prefix: string;
}

export interface UserBalance {
  coins_balance: number;
  total_earned: number;
  total_redeemed: number;
}

export interface RedemptionResult {
  redemption_id: number;
  reward_id: string;
  reward_title: string;
  cost_coins: number;
  voucher_code: string;
  remaining_balance: number;
  status: string;
  timestamp: string;
}

export interface FilterState {
  search: string;
  category: string;
  status: string;
  payment_method: string;
  min_amount: string;
  max_amount: string;
  start_date: string;
  end_date: string;
  sort_by: string;
  sort_order: 'asc' | 'desc';
  page: number;
  limit: number;
}
