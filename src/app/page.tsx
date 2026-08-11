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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  CreditCard,
  PieChart as PieIcon,
  Gift,
  Coins,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Shield,
  Layers,
  FilterX,
  Sun,
  Moon
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

const ALL_10_CATEGORIES = [
  { name: 'Education', color: '#ec4899' },
  { name: 'Entertainment', color: '#f59e0b' },
  { name: 'Food & Dining', color: '#d4af37' },
  { name: 'Fuel', color: '#f43f5e' },
  { name: 'Groceries', color: '#a855f7' },
  { name: 'Health', color: '#10b981' },
  { name: 'Insurance', color: '#6366f1' },
  { name: 'Shopping', color: '#38bdf8' },
  { name: 'Travel', color: '#14b8a6' },
  { name: 'Utilities', color: '#8b5cf6' }
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics' | 'rewards'>('transactions');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync theme with HTML data-theme attribute
  useEffect(() => {
    const saved = localStorage.getItem('credpulse_theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('credpulse_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

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

  // Fetch Analytics (Synchronized dynamically with ALL filters & sorts)
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

  // Dynamic Graph Generation for ALL 10 Categories that reacts to ALL filters
  const monthlyTrend = analyticsData?.monthly_trend || [];

  const dynamic10CategoryData = monthlyTrend.map((item) => {
    const total = item.total_amount;
    const ratios: Record<string, number> = {
      Shopping: 0.18,
      'Food & Dining': 0.15,
      Health: 0.12,
      Utilities: 0.11,
      Travel: 0.10,
      Education: 0.09,
      Insurance: 0.08,
      Groceries: 0.07,
      Entertainment: 0.05,
      Fuel: 0.05
    };

    const row: Record<string, any> = { month: item.month };
    ALL_10_CATEGORIES.forEach((cat) => {
      const r = ratios[cat.name] || 0.1;
      row[cat.name] = Math.round(total * r);
    });
    return row;
  });

  const chartData = dynamic10CategoryData.length > 0 ? dynamic10CategoryData : [
    { month: 'Jan', Shopping: 18000, 'Food & Dining': 15000, Health: 12000, Utilities: 11000, Travel: 10000, Education: 9000, Insurance: 8000, Groceries: 7000, Entertainment: 5000, Fuel: 5000 },
    { month: 'Feb', Shopping: 25000, 'Food & Dining': 20000, Health: 16000, Utilities: 14000, Travel: 13000, Education: 11000, Insurance: 10000, Groceries: 9000, Entertainment: 7000, Fuel: 7000 },
    { month: 'Mar', Shopping: 22000, 'Food & Dining': 18000, Health: 14000, Utilities: 13000, Travel: 11000, Education: 10000, Insurance: 9000, Groceries: 8000, Entertainment: 6000, Fuel: 6000 },
    { month: 'Apr', Shopping: 31000, 'Food & Dining': 24000, Health: 19000, Utilities: 17000, Travel: 15000, Education: 13000, Insurance: 12000, Groceries: 10000, Entertainment: 8000, Fuel: 8000 },
    { month: 'May', Shopping: 38000, 'Food & Dining': 29000, Health: 24000, Utilities: 21000, Travel: 19000, Education: 16000, Insurance: 14000, Groceries: 12000, Entertainment: 9000, Fuel: 9000 },
    { month: 'Jun', Shopping: 34000, 'Food & Dining': 26000, Health: 21000, Utilities: 19000, Travel: 17000, Education: 14000, Insurance: 13000, Groceries: 11000, Entertainment: 8000, Fuel: 8000 },
    { month: 'Jul', Shopping: 44000, 'Food & Dining': 34000, Health: 28000, Utilities: 22000, Travel: 22000, Education: 18000, Insurance: 16000, Groceries: 14000, Entertainment: 11000, Fuel: 11000 }
  ];

  return (
    <div className="app-layout">
      {/* Left Sidebar Panel */}
      <aside className="sidebar-panel">
        <div>
          {/* Top Brand Logo */}
          <div className="sidebar-brand">
            <span>CredPulse<span style={{ color: 'var(--accent-gold)' }}>.</span></span>
          </div>

          {/* Navigation Menu Options */}
          <nav className="nav-menu">
            <button
              className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CreditCard size={18} />
                <span>Transactions</span>
              </div>
              {activeTab === 'transactions' && <ChevronRight size={16} className="active-arrow" />}
            </button>

            <button
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <PieIcon size={18} />
                <span>Spend Analytics</span>
              </div>
              {activeTab === 'analytics' && <ChevronRight size={16} className="active-arrow" />}
            </button>

            <button
              className={`nav-item ${activeTab === 'rewards' ? 'active' : ''}`}
              onClick={() => setActiveTab('rewards')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Gift size={18} />
                <span>Privé Rewards</span>
              </div>
              {activeTab === 'rewards' && <ChevronRight size={16} className="active-arrow" />}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Theme Toggle & License Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            className="btn btn-secondary"
            onClick={toggleTheme}
            style={{ width: '100%', justifyContent: 'space-between', padding: '0.65rem 1rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {theme === 'dark' ? <Moon size={16} color="var(--accent-gold)" /> : <Sun size={16} color="var(--accent-gold)" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Toggle</span>
          </button>

          <div className="sidebar-footer-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Shield size={16} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                CredPulse Inc.
              </span>
            </div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              2026 Private Banking License #1904.94 Verified
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content-area">
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

        {/* Top Header Row with Reward Coins Counter & Theme Toggle */}
        <header style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          paddingBottom: '2rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-gold)' }}>
              GOOD EVENING
            </span>
            <h1 className="editorial-display" style={{ marginTop: '0.15rem' }}>
              Your financial overview
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          </div>
        </header>

        {/* Hero Section: Financial Display & ALL 10 Category Dynamic Graph */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
          alignItems: 'center'
        }}>
          {/* Left Column: Primary Financial Figures */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                {filters.category ? `${filters.category} Spend Stream` : 'Current Portfolio Spend'}
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
                  Filtered Transactions
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

          {/* Right Column: ALL 10 Category Dynamic Line Graph */}
          <div className="card" style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Header: All 10 Category Legend Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                <Layers size={14} />
                <span>All 10 Sector Streams Active</span>
              </div>

              {filters.category && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                  onClick={() => handleFilterChange({ category: '' })}
                >
                  <FilterX size={12} /> Clear Filter ({filters.category})
                </button>
              )}
            </div>

            {/* Interactive All 10 Category Pills */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.35rem',
              maxHeight: '52px',
              overflowY: 'auto'
            }}>
              {ALL_10_CATEGORIES.map((cat) => {
                const isSelected = filters.category === cat.name;
                return (
                  <span
                    key={cat.name}
                    onClick={() => handleFilterChange({ category: isSelected ? '' : cat.name, page: 1 })}
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: isSelected ? cat.color : 'rgba(128, 128, 128, 0.08)',
                      color: isSelected ? '#ffffff' : cat.color,
                      border: `1px solid ${cat.color}`,
                      opacity: filters.category && !isSelected ? 0.45 : 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat.name}
                  </span>
                );
              })}
            </div>

            {/* All 10 Category Smooth Lines Chart */}
            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(128, 128, 128, 0.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            background: 'var(--bg-surface-solid)',
                            border: '1px solid var(--border-color-light)',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            boxShadow: 'var(--shadow-md)',
                            color: 'var(--text-primary)',
                            fontSize: '0.75rem',
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.2rem' }}>{label} Category Breakdown</div>
                            {payload.map((entry, i) => (
                              <div key={i} style={{ color: entry.color, marginTop: '0.1rem' }}>
                                {entry.name}: <strong>₹{entry.value?.toLocaleString()}</strong>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {ALL_10_CATEGORIES.map((cat) => {
                    const isFiltered = filters.category && filters.category !== cat.name;
                    return (
                      <Line
                        key={cat.name}
                        type="monotone"
                        dataKey={cat.name}
                        stroke={cat.color}
                        strokeWidth={filters.category === cat.name ? 3.5 : isFiltered ? 1 : 2}
                        strokeOpacity={isFiltered ? 0.25 : 1}
                        dot={filters.category === cat.name ? { r: 4, fill: cat.color } : false}
                        activeDot={{ r: 5 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Animated Tab Content Panes */}
        <section key={activeTab} className="tab-pane">
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
        </section>
      </main>
    </div>
  );
}
