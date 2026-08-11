'use client';

import React from 'react';
import { AnalyticsResponse, FilterState } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, ArrowRight, FilterX } from 'lucide-react';

interface Props {
  data: AnalyticsResponse | null;
  loading: boolean;
  activeCategoryFilter: string;
  onSelectCategoryFilter: (category: string) => void;
  onClearCategoryFilter: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Health: '#10b981',       // Emerald
  Insurance: '#3b82f6',    // Blue
  'Food & Dining': '#f59e0b', // Amber
  Fuel: '#ef4444',         // Red
  Utilities: '#8b5cf6',    // Purple
  Education: '#ec4899',    // Pink
  Shopping: '#6366f1',     // Indigo
  Travel: '#06b6d4',       // Cyan
  Entertainment: '#f97316',// Orange
  Groceries: '#14b8a6'     // Teal
};

export const SpendAnalytics: React.FC<Props> = ({
  data,
  loading,
  activeCategoryFilter,
  onSelectCategoryFilter,
  onClearCategoryFilter
}) => {
  if (loading || !data) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="skeleton-box" style={{ height: '300px', width: '100%' }} />
      </div>
    );
  }

  const { category_breakdown, monthly_trend, overall_stats } = data;

  const formattedTotalSpent = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(overall_stats.total_spent);

  const formattedAvgTxn = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(overall_stats.avg_transaction);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Metric Cards Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #182235 0%, #1e2d47 100%)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Filtered Spend
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {formattedTotalSpent}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across {overall_stats.total_transactions.toLocaleString()} transactions
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Success Rate
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.25rem' }}>
            {overall_stats.success_rate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Successful bill payments
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Avg Transaction Value
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {formattedAvgTxn}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Average amount per payment
          </span>
        </div>
      </div>

      {/* Cross-filtering Banner Indicator */}
      {activeCategoryFilter && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <PieIcon size={18} color="var(--accent-primary)" />
            <span>Filtering transactions by category: <strong style={{ color: 'var(--accent-primary)' }}>{activeCategoryFilter}</strong></span>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
            onClick={onClearCategoryFilter}
          >
            <FilterX size={14} /> Clear Category Filter
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Category Breakdown Donut Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Spending by Category</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click any slice to filter table</p>
            </div>
            <PieIcon size={20} color="var(--accent-primary)" />
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={category_breakdown}
                  dataKey="total_amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  onClick={(entry) => onSelectCategoryFilter(entry.category)}
                  style={{ cursor: 'pointer' }}
                >
                  {category_breakdown.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category] || '#6366f1'}
                      stroke={activeCategoryFilter === entry.category ? '#ffffff' : 'transparent'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    background: '#151d2f',
                    borderColor: '#27354e',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Monthly Spend Trend</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Month-over-month volume</p>
            </div>
            <BarChart3 size={20} color="var(--color-success)" />
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27354e" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Total Spent']}
                  contentStyle={{
                    background: '#151d2f',
                    borderColor: '#27354e',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="total_amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
