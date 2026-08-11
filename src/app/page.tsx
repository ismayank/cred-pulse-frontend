'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FilterState,
  TransactionsResponse,
  AnalyticsResponse,
  UserBalance,
  RewardItem
} from '@/types';
import {
  fetchTransactions,
  fetchAnalytics,
  fetchUserBalance,
  fetchRewardsCatalogue
} from '@/lib/api';
import { TransactionsTable } from '@/components/table/TransactionsTable';
import { SpendAnalytics } from '@/components/analytics/SpendAnalytics';
import { RewardsSection } from '@/components/rewards/RewardsSection';
import {
  CreditCard,
  PieChart as PieIcon,
  Gift,
  Coins,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  search: '',
  category: '',
  status: '',
  payment_method: '',
  min_amount: '',
  max_amount: '',
  start_date: '',
  end_date: '',
  sort_by: 'timestamp',
  sort_order: 'desc',
  page: 1,
  limit: 20
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics' | 'rewards'>('transactions');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Data states
  const [transactionsData, setTransactionsData] = useState<TransactionsResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [rewardsCatalogue, setRewardsCatalogue] = useState<RewardItem[]>([]);

  // Loading & error states
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(true);
  const [rewardsLoading, setRewardsLoading] = useState<boolean>(true);
  const [tableError, setTableError] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Transactions
  const loadTransactions = useCallback(async () => {
    setTableLoading(true);
    setTableError(null);
    try {
      const data = await fetchTransactions(filters);
      setTransactionsData(data);
    } catch (err: any) {
      setTableError(err.message || 'Error connecting to API server');
    } finally {
      setTableLoading(false);
    }
  }, [filters]);

  // Fetch Analytics (Synchronized with filters)
  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const data = await fetchAnalytics(filters);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [filters]);

  // Fetch Rewards
  const loadRewardsData = useCallback(async () => {
    setRewardsLoading(true);
    try {
      const [bal, cat] = await Promise.all([
        fetchUserBalance(),
        fetchRewardsCatalogue()
      ]);
      setUserBalance(bal);
      setRewardsCatalogue(cat);
    } catch (err) {
      console.error('Rewards error:', err);
    } finally {
      setRewardsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
    loadAnalytics();
  }, [loadTransactions, loadAnalytics]);

  useEffect(() => {
    loadRewardsData();
  }, [loadRewardsData]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 1000,
          background: toast.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#f43f5e'}`,
          color: '#ffffff',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          animation: 'slideUp 0.2s ease-out'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <header style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px var(--accent-glow)'
          }}>
            <CreditCard size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              Cred<span style={{ color: 'var(--accent-primary)' }}>Pulse</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Credit Card Transactions & Rewards Hub
            </p>
          </div>
        </div>

        {/* Global Rewards Coin Counter */}
        {userBalance && (
          <div
            onClick={() => setActiveTab('rewards')}
            style={{
              cursor: 'pointer',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '9999px',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Coins size={20} color="var(--color-amber)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', lineHeight: 1 }}>
                Coin Balance
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-amber)', lineHeight: 1.2 }}>
                {userBalance.coins_balance.toLocaleString()}
              </span>
            </div>
            <Sparkles size={16} color="var(--color-amber)" />
          </div>
        )}
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        <button
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('transactions')}
        >
          <CreditCard size={18} />
          Transactions Dashboard
        </button>

        <button
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('analytics')}
        >
          <PieIcon size={18} />
          Spend Analytics
        </button>

        <button
          className={`btn ${activeTab === 'rewards' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('rewards')}
        >
          <Gift size={18} />
          Rewards Catalogue
        </button>
      </nav>

      {/* Tab Content */}
      <main>
        {activeTab === 'transactions' && (
          <TransactionsTable
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            dataResponse={transactionsData}
            loading={tableLoading}
            error={tableError}
            onRetry={loadTransactions}
          />
        )}

        {activeTab === 'analytics' && (
          <SpendAnalytics
            data={analyticsData}
            loading={analyticsLoading}
            activeCategoryFilter={filters.category}
            onSelectCategoryFilter={(cat) => {
              handleFilterChange({ category: cat, page: 1 });
              setActiveTab('transactions');
              showToast(`Filtered transactions by category: ${cat}`, 'success');
            }}
            onClearCategoryFilter={() => handleFilterChange({ category: '' })}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsSection
            balance={userBalance}
            catalogue={rewardsCatalogue}
            loading={rewardsLoading}
            onBalanceUpdated={setUserBalance}
            onShowToast={showToast}
          />
        )}
      </main>
    </div>
  );
}
