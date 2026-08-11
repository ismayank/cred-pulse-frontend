'use client';

import React, { useState, useRef } from 'react';
import { AnalyticsResponse } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Customized
} from 'recharts';
import { PieChart as PieIcon, BarChart3, FilterX, Layers, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface Props {
  data: AnalyticsResponse | null;
  loading: boolean;
  activeCategoryFilter: string;
  onSelectCategoryFilter: (category: string) => void;
  onClearCategoryFilter: () => void;
}

const LUXURY_CATEGORY_COLORS: Record<string, string> = {
  Health: '#10b981',          // Emerald
  Insurance: '#6366f1',       // Indigo
  'Food & Dining': '#d4af37', // Gold
  Fuel: '#f43f5e',            // Crimson
  Utilities: '#8b5cf6',       // Violet
  Education: '#ec4899',       // Rose
  Shopping: '#38bdf8',        // Sky Blue
  Travel: '#14b8a6',          // Teal
  Entertainment: '#f59e0b',   // Amber
  Groceries: '#a855f7'        // Purple
};

export const SpendAnalytics: React.FC<Props> = ({
  data,
  loading,
  activeCategoryFilter,
  onSelectCategoryFilter,
  onClearCategoryFilter
}) => {
  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState<{
    category: string;
    total_amount: number;
    count: number;
    percentage: number;
  } | null>(null);

  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const activeSectorRef = useRef<any>(null);

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

  // Calculate percentages if missing from backend response
  const totalAmountSum = category_breakdown.reduce((sum, item) => sum + item.total_amount, 0) || 1;
  const enrichedBreakdown = category_breakdown.map((item) => ({
    ...item,
    percentage: item.percentage || Number(((item.total_amount / totalAmountSum) * 100).toFixed(1))
  }));

  const activeCategoryDetail = selectedCategoryInfo || 
    enrichedBreakdown.find((item) => item.category === activeCategoryFilter) || 
    enrichedBreakdown[0];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
    const item = enrichedBreakdown[index];
    if (item) {
      setSelectedCategoryInfo(item);
    }
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
    activeSectorRef.current = null;
  };

  // Capture hovered sector geometry so Customized overlay can paint it at highest SVG z-index
  const renderActiveShape = (props: any) => {
    activeSectorRef.current = props;
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Metric Cards Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="card" style={{ borderLeft: '3px solid var(--accent-gold)' }}>
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
            <FilterX size={14} /> Clear Filter
          </button>
        </div>
      )}

      {/* Interactive Pie Chart & Selected Category Spend Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Pie Chart Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Category Distribution
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                Spend by Category
              </h3>
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Hover or click pie slice</span>
          </div>

          {/* Donut Chart */}
          <div style={{ width: '100%', height: 260, position: 'relative' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={enrichedBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="total_amount"
                  nameKey="category"
                  cursor="pointer"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  onClick={(entry) => {
                    setSelectedCategoryInfo(entry);
                    onSelectCategoryFilter(entry.category);
                  }}
                >
                  {enrichedBreakdown.map((entry, index) => {
                    const color = LUXURY_CATEGORY_COLORS[entry.category] || `hsl(${(index * 36) % 360}, 65%, 55%)`;
                    const isSelected = activeCategoryDetail?.category === entry.category;
                    const isDimmed = activeIndex !== undefined && activeIndex !== index;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={color}
                        stroke={isSelected ? '#ffffff' : 'rgba(0,0,0,0.2)'}
                        strokeWidth={isSelected ? 3 : 1}
                        opacity={isDimmed ? 0.6 : 1}
                        style={{ transition: 'opacity 0.2s ease' }}
                      />
                    );
                  })}
                </Pie>

                {/* Top-layer SVG Overlay to pop hovered pie slice smoothly above all adjacent slices */}
                <Customized
                  component={() => {
                    if (activeIndex === undefined || !activeSectorRef.current) return null;
                    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = activeSectorRef.current;
                    return (
                      <g style={{ pointerEvents: 'none', filter: 'var(--pie-active-filter)' }}>
                        <Sector
                          cx={cx}
                          cy={cy}
                          innerRadius={innerRadius - 3}
                          outerRadius={outerRadius + 9}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          fill={fill}
                          stroke="var(--pie-active-stroke, #ffffff)"
                          strokeWidth={3.5}
                        />
                      </g>
                    );
                  }}
                />

                <Tooltip
                  wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
                  offset={15}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const dataItem = payload[0].payload;
                      const formatted = new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(dataItem.total_amount);
                      return (
                        <div style={{
                          background: 'var(--bg-surface-solid)',
                          border: '1px solid var(--border-color-light)',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          boxShadow: 'var(--shadow-md)',
                          color: 'var(--text-primary)',
                          fontSize: '0.825rem',
                          minWidth: '170px'
                        }}>
                          <div style={{
                            fontWeight: 800,
                            color: 'var(--accent-gold)',
                            fontSize: '0.9rem',
                            marginBottom: '0.35rem',
                            borderBottom: '1px solid var(--border-color)',
                            paddingBottom: '0.25rem'
                          }}>
                            {dataItem.category}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.25rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Amount:</span>
                            <strong style={{ color: 'var(--text-primary)' }}>{formatted}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.2rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Transactions:</span>
                            <strong style={{ color: 'var(--text-primary)' }}>{dataItem.count.toLocaleString()}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.2rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Share:</span>
                            <strong style={{ color: 'var(--color-success, #10b981)' }}>{dataItem.percentage}%</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Donut Center Display (Fades out during slice hover to prevent tooltip text overlap) */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: activeIndex !== undefined ? 0 : 1,
              transition: 'opacity 0.2s ease'
            }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Selected Category
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '0.1rem' }}>
                {activeCategoryDetail?.category || 'All Categories'}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Category Spend Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Category Breakdown
              </span>
              <span className="badge badge-success">Active Stream</span>
            </div>

            <h2 className="editorial-display" style={{ fontSize: '2.25rem', color: 'var(--accent-gold)' }}>
              {activeCategoryDetail ? activeCategoryDetail.category : 'Select Category'}
            </h2>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Spend Volume</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {activeCategoryDetail ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(activeCategoryDetail.total_amount) : '₹0'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Transaction Count</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {activeCategoryDetail ? activeCategoryDetail.count.toLocaleString() : '0'} transactions
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Share of Total Spend</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {activeCategoryDetail ? `${activeCategoryDetail.percentage}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={() => {
              if (activeCategoryDetail) {
                onSelectCategoryFilter(activeCategoryDetail.category);
              }
            }}
          >
            <span>Filter Transactions Table by {activeCategoryDetail?.category}</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Monthly Category Trend Bar Chart */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Timeline Analysis
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
            Monthly Settlement Volume
          </h3>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={monthly_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataItem = payload[0].payload;
                    const formatted = new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(dataItem.total_amount);
                    return (
                      <div style={{
                        background: 'var(--bg-surface-solid)',
                        border: '1px solid var(--border-color-light)',
                        padding: '0.65rem 0.95rem',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{label} Total</div>
                        <div>Spend: <strong>{formatted}</strong></div>
                        <div>Txns: <strong>{dataItem.count.toLocaleString()}</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total_amount" fill="var(--accent-gold)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
