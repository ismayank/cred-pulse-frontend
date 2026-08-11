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
  Wifi,
  Crown
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
          padding: '0.85rem 1.35rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          animation: 'slideUp 0.2s ease-out'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Editorial Header */}
      <header style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        paddingBottom: '2.25rem',
        marginBottom: '2.5rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Brand & Private Banking Identifier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #111520 0%, #1c2334 100%)',
            border: '1px solid var(--border-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Crown size={20} color="var(--accent-gold)" />
          </div>
          <div>
            <h1 className="font-serif" style={{
              fontSize: '2rem',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
              lineHeight: 1.1
            }}>
              CredPulse <span style={{ fontSize: '0.95rem', fontStyle: 'italic', opacity: 0.5, fontFamily: 'var(--font-sans)', fontWeight: 400 }}>Private Banking</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '0.2rem' }}>
              Wealth & Spend Portfolio
            </p>
          </div>
        </div>

        {/* Global Rewards Coin Counter */}
        {userBalance && (
          <div
            onClick={() => setActiveTab('rewards')}
            style={{
              cursor: 'pointer',
              background: 'rgba(212, 175, 55, 0.04)',
              border: '1px solid var(--border-accent)',
              borderRadius: '9999px',
              padding: '0.5rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4af37 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Coins size={14} color="#fff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Reward Balance
              </span>
              <span className="font-serif" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', lineHeight: 1 }}>
                {userBalance.coins_balance.toLocaleString()}
              </span>
            </div>
            <Sparkles size={15} color="var(--accent-gold)" style={{ marginLeft: '0.2rem' }} />
          </div>
        )}
      </header>

      {/* Editorial Hero Area (Greeting + Large Financial Display + Physical Card) */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2.5rem',
        marginBottom: '3rem',
        alignItems: 'center'
      }}>
        {/* Left Column: Editorial Greeting & Primary Financial Numbers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-gold)' }}>
              GOOD EVENING
            </span>
            <h2 className="editorial-display" style={{ marginTop: '0.25rem' }}>
              Your financial overview
            </h2>
          </div>

          <div style={{ padding: '0.5rem 0' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Current Portfolio Spend
            </span>
            <div className="editorial-display" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {analyticsData?.overall_stats ? `₹${analyticsData.overall_stats.total_spent.toLocaleString()}` : '₹0'}
            </div>
          </div>

          {/* Sub-metrics */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Available Limit
              </span>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                ₹5,00,000
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Total Transactions
              </span>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {transactionsData?.pagination ? transactionsData.pagination.total_items.toLocaleString() : '10,000'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Settlement Rate
              </span>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.2rem' }}>
                {analyticsData?.overall_stats ? `${analyticsData.overall_stats.success_rate.toFixed(1)}%` : '92.4%'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Matte Metal Credit Card */}
        <div className="matte-metal-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '235px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                CENTURION PRIVÉ
              </span>
            </div>
            <Wifi size={22} style={{ opacity: 0.6 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', margin: '1.5rem 0' }}>
            <div className="emv-chip-gold" />
            <span style={{ fontSize: '1.3rem', fontWeight: 600, letterSpacing: '0.22em', fontFamily: 'monospace', textShadow: '0 2px 4px rgba(0,0,0,0.7)', opacity: 0.9 }}>
              •••• •••• •••• 8829
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.6, color: 'var(--text-secondary)' }}>
                Cardholder
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.06em', marginTop: '0.1rem' }}>
                MAYANK SINGH
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.6, color: 'var(--text-secondary)' }}>
                Expires
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.06em', marginTop: '0.1rem' }}>
                08/29
              </div>
            </div>
            <div className="font-serif" style={{ fontSize: '1.35rem', fontStyle: 'italic', color: '#e2e8f0', opacity: 0.9 }}>
              Visa Infinite
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Bar (Minimal Refined Tabs) */}
      <nav style={{
        display: 'flex',
        gap: '0.625rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.75rem'
      }}>
        <button
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('transactions')}
          style={{ borderRadius: '9999px' }}
        >
          <CreditCard size={15} />
          Transactions Register
        </button>

        <button
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('analytics')}
          style={{ borderRadius: '9999px' }}
        >
          <PieIcon size={15} />
          Spend Analytics
        </button>

        <button
          className={`btn ${activeTab === 'rewards' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('rewards')}
          style={{ borderRadius: '9999px' }}
        >
          <Gift size={15} />
          Privé Rewards
        </button>
      </nav>

      {/* Main Tab Content */}
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
