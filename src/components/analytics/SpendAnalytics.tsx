'use client';

import React from 'react';
import { AnalyticsResponse } from '@/types';
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
import { PieChart as PieIcon, BarChart3, FilterX } from 'lucide-react';

interface Props {
  data: AnalyticsResponse | null;
  loading: boolean;
  activeCategoryFilter: string;
  onSelectCategoryFilter: (category: string) => void;
  onClearCategoryFilter: () => void;
}

const LUXURY_CATEGORY_COLORS: Record<string, string> = {
  Health: '#10b981',       // Emerald
  Insurance: '#6366f1',    // Indigo
  'Food & Dining': '#d4af37', // Gold
  Fuel: '#f43f5e',         // Crimson
  Utilities: '#8b5cf6',    // Violet
  Education: '#ec4899',    // Rose
  Shopping: '#38bdf8',     // Sky Blue
  Travel: '#14b8a6',       // Teal
  Entertainment: '#f59e0b',// Amber
  Groceries: '#a855f7'     // Purple
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
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div className="skeleton-box" style={{ height: '320px', width: '100%' }} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Metric Cards Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(17, 21, 32, 0.9) 0%, rgba(26, 32, 48, 0.8) 100%)' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Total Filtered Spend
          </span>
          <div className="editorial-num" style={{ marginTop: '0.4rem' }}>
            {formattedTotalSpent}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Across {overall_stats.total_transactions.toLocaleString()} settled transactions
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Settlement Rate
          </span>
          <div className="editorial-num" style={{ color: 'var(--color-success)', marginTop: '0.4rem' }}>
            {overall_stats.success_rate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Successful card authorizations
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Average Ticket Size
          </span>
          <div className="editorial-num" style={{ marginTop: '0.4rem' }}>
            {formattedAvgTxn}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Average transaction value
          </span>
        </div>
      </div>

      {/* Cross-filtering Banner Indicator */}
      {activeCategoryFilter && (
        <div style={{
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid var(--border-accent)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem' }}>
            <PieIcon size={18} color="var(--accent-gold)" />
            <span>Filtering transactions by category: <strong style={{ color: 'var(--accent-gold)' }}>{activeCategoryFilter}</strong></span>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
            onClick={onClearCategoryFilter}
          >
            <FilterX size={14} /> Reset Filter
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Category Breakdown Donut Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Category Distribution</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>Click any segment to filter table</p>
            </div>
            <PieIcon size={18} color="var(--accent-gold)" />
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={category_breakdown}
                  dataKey="total_amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  onClick={(entry) => onSelectCategoryFilter(entry.category)}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {category_breakdown.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={LUXURY_CATEGORY_COLORS[entry.category] || '#6366f1'}
                      stroke={activeCategoryFilter === entry.category ? '#ffffff' : 'rgba(8, 10, 15, 0.8)'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    background: '#0d1017',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px', opacity: 0.85 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Monthly Spend Velocity</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>Month-over-month volume</p>
            </div>
            <BarChart3 size={18} color="var(--accent-gold)" />
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Total Spent']}
                  contentStyle={{
                    background: '#0d1017',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}
                />
                <Bar dataKey="total_amount" fill="#d4af37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
