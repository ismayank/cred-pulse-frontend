import {
  TransactionsResponse,
  AnalyticsResponse,
  RewardItem,
  UserBalance,
  RedemptionResult,
  FilterState
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://credpulse-backend.onrender.com';

export async function fetchTransactions(filters: FilterState): Promise<TransactionsResponse> {
  const params = new URLSearchParams();
  
  params.append('page', filters.page.toString());
  params.append('limit', filters.limit.toString());
  params.append('sort_by', filters.sort_by);
  params.append('sort_order', filters.sort_order);

  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.payment_method) params.append('payment_method', filters.payment_method);
  if (filters.min_amount) params.append('min_amount', filters.min_amount);
  if (filters.max_amount) params.append('max_amount', filters.max_amount);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);

  const res = await fetch(`${API_BASE_URL}/api/transactions?${params.toString()}`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch transactions: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAnalytics(filters: Partial<FilterState>): Promise<AnalyticsResponse> {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.payment_method) params.append('payment_method', filters.payment_method);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.min_amount) params.append('min_amount', filters.min_amount);
  if (filters.max_amount) params.append('max_amount', filters.max_amount);

  const res = await fetch(`${API_BASE_URL}/api/analytics/summary?${params.toString()}`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch analytics: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchUserBalance(): Promise<UserBalance> {
  const res = await fetch(`${API_BASE_URL}/api/rewards/balance`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch user balance: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchRewardsCatalogue(): Promise<RewardItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/rewards/catalogue`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch rewards catalogue: ${res.statusText}`);
  }
  return res.json();
}

export async function redeemReward(rewardId: string): Promise<RedemptionResult> {
  const res = await fetch(`${API_BASE_URL}/api/rewards/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reward_id: rewardId }),
    cache: 'no-store'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to redeem reward' }));
    throw new Error(errorData.detail || `Redemption failed with status ${res.status}`);
  }

  return res.json();
}
