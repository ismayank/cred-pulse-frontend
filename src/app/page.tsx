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
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Wifi
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
          bottom: '2rem',
          right: '2rem',
          zIndex: 1000,
          background: toast.type === 'success' ? 'rgba(6, 95, 70, 0.95)' : 'rgba(153, 27, 27, 0.95)',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#f43f5e'}`,
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          animation: 'slideUp 0.2s ease-out'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Dribbble Style Header Bar */}
      <header style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        paddingBottom: '1.75rem',
        marginBottom: '1.75rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <CreditCard size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
              lineHeight: 1.1
            }}>
              Cred<span style={{ color: 'var(--accent-primary)' }}>Pulse</span>
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Credit Card Transactions, Analytics & Rewards Engine
            </p>
          </div>
        </div>

        {/* Global Rewards Coin Counter Widget */}
        {userBalance && (
          <div
            onClick={() => setActiveTab('rewards')}
            style={{
              cursor: 'pointer',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '9999px',
              padding: '0.625rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.12)'
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Coins size={18} color="#fff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Reward Coins
              </span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1.1, fontFamily: 'var(--font-heading)' }}>
                {userBalance.coins_balance.toLocaleString()}
              </span>
            </div>
            <Sparkles size={18} color="#fbbf24" style={{ marginLeft: '0.25rem' }} />
          </div>
        )}
      </header>

      {/* Dribbble Hero Banner: Credit Card + Quick Metrics Grid */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Credit Card Cardholder Visual Widget */}
        <div className="credit-card-widget" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.05em', fontFamily: 'var(--font-heading)' }}>
                CRED<span style={{ color: '#818cf8' }}>PULSE</span> PLATINUM
              </span>
            </div>
            <Wifi size={24} style={{ opacity: 0.8 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
            <div className="emv-chip" />
            <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.25em', fontFamily: 'monospace', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              •••• •••• •••• 8829
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>
                Cardholder
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                MAYANK SINGH
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>
                Expires
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                08/29
              </div>
            </div>
            <div style={{
              fontSize: '1rem',
              fontWeight: 900,
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              VISA
            </div>
          </div>
        </div>

        {/* Dribbble Dashboard Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {/* Card 1: Total Spend */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Spend
              </span>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="var(--accent-primary)" />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                {analyticsData?.overall_stats ? `₹${analyticsData.overall_stats.total_spent.toLocaleString()}` : '₹0'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, marginTop: '0.25rem' }}>
                <ArrowUpRight size={14} /> +12.4% this month
              </div>
            </div>
          </div>

          {/* Card 2: Total Transactions */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Transactions
              </span>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="var(--accent-cyan)" />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                {transactionsData?.pagination ? transactionsData.pagination.total_items.toLocaleString() : '10,000'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.25rem' }}>
                100% Verified Postgres
              </div>
            </div>
          </div>

          {/* Card 3: Success Rate */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Success Rate
              </span>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} color="var(--color-success)" />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                {analyticsData?.overall_stats ? `${analyticsData.overall_stats.success_rate.toFixed(1)}%` : '92.4%'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, marginTop: '0.25rem' }}>
                Operational & Active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs (Glassmorphism Pill Buttons) */}
      <nav style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.75rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.75rem'
      }}>
        <button
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('transactions')}
          style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem' }}
        >
          <CreditCard size={18} />
          Transactions Dashboard
        </button>

        <button
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('analytics')}
          style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem' }}
        >
          <PieIcon size={18} />
          Spend Analytics
        </button>

        <button
          className={`btn ${activeTab === 'rewards' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('rewards')}
          style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem' }}
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
