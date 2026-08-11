'use client';

import React, { useState, useEffect } from 'react';
import {
  Transaction,
  FilterState,
  TransactionsResponse
} from '@/types';
import { Badge } from '@/components/ui/Badge';
import { TransactionDetailModal } from '@/components/table/TransactionDetailModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

interface Props {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  dataResponse: TransactionsResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const TransactionsTable: React.FC<Props> = ({
  filters,
  onFilterChange,
  onResetFilters,
  dataResponse,
  loading,
  error,
  onRetry
}) => {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounced search handling
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  const handleSort = (field: string) => {
    if (filters.sort_by === field) {
      onFilterChange({
        sort_order: filters.sort_order === 'asc' ? 'desc' : 'asc',
        page: 1
      });
    } else {
      onFilterChange({
        sort_by: field,
        sort_order: 'desc',
        page: 1
      });
    }
  };

  const renderSortIcon = (field: string) => {
    if (filters.sort_by !== field) {
      return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    }
    return filters.sort_order === 'asc' ? (
      <ArrowUp size={14} style={{ color: 'var(--accent-primary)' }} />
    ) : (
      <ArrowDown size={14} style={{ color: 'var(--accent-primary)' }} />
    );
  };

  const pagination = dataResponse?.pagination;
  const transactions = dataResponse?.data || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search & Filter Controls Toolbar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Merchant Search Input */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '240px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              className="custom-input"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
              placeholder="Search merchant name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Category Selector */}
          <select
            className="custom-select"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value, page: 1 })}
          >
            <option value="">All Categories</option>
            {dataResponse?.available_categories?.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            className="custom-select"
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
          >
            <option value="">All Statuses</option>
            {dataResponse?.available_statuses?.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Payment Method Selector */}
          <select
            className="custom-select"
            value={filters.payment_method}
            onChange={(e) => onFilterChange({ payment_method: e.target.value, page: 1 })}
          >
            <option value="">All Payment Methods</option>
            {dataResponse?.available_payment_methods?.map((pm) => (
              <option key={pm} value={pm}>{pm}</option>
            ))}
          </select>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-secondary ${showAdvancedFilters ? 'active' : ''}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter size={16} />
              More Filters
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchInput('');
                onResetFilters();
              }}
              title="Reset all filters"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters (Amount Range & Date Range) */}
        {showAdvancedFilters && (
          <div
            className="filters-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)'
            }}
          >
            <div className="input-group">
              <label className="input-label">Min Amount (₹)</label>
              <input
                type="number"
                className="custom-input"
                placeholder="0"
                value={filters.min_amount}
                onChange={(e) => onFilterChange({ min_amount: e.target.value, page: 1 })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Max Amount (₹)</label>
              <input
                type="number"
                className="custom-input"
                placeholder="50000"
                value={filters.max_amount}
                onChange={(e) => onFilterChange({ max_amount: e.target.value, page: 1 })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Start Date</label>
              <input
                type="date"
                className="custom-input"
                value={filters.start_date}
                onChange={(e) => onFilterChange({ start_date: e.target.value, page: 1 })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">End Date</label>
              <input
                type="date"
                className="custom-input"
                value={filters.end_date}
                onChange={(e) => onFilterChange({ end_date: e.target.value, page: 1 })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hand-Built Custom CSS Table Container */}
      <div className="table-container">
        <table className="custom-table" role="grid" aria-label="Transactions table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('id')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  Txn ID {renderSortIcon('id')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('timestamp')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  Date & Time {renderSortIcon('timestamp')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('merchant')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  Merchant {renderSortIcon('merchant')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('category')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  Category {renderSortIcon('category')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('amount')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  Amount {renderSortIcon('amount')}
                </div>
              </th>
              <th className="hide-mobile">Payment Method</th>
              <th className="sortable" onClick={() => handleSort('status')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  Status {renderSortIcon('status')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // 5 Skeleton Loading Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="skeleton-row">
                  <td><div className="skeleton-box" style={{ width: '90px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '130px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '110px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '80px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '70px' }} /></td>
                  <td className="hide-mobile"><div className="skeleton-box" style={{ width: '90px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '80px' }} /></td>
                </tr>
              ))
            ) : error ? (
              // Error State
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertCircle size={36} color="var(--color-failed)" />
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Failed to load transactions
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{error}</div>
                    <button className="btn btn-primary" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
                      Retry Request
                    </button>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <FileSpreadsheet size={42} color="var(--text-muted)" />
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      No matching transactions found
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '360px' }}>
                      Try adjusting your search keywords, amount range, or clearing category filters.
                    </div>
                    <button className="btn btn-secondary" onClick={onResetFilters} style={{ marginTop: '0.5rem' }}>
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              // Populated Rows
              transactions.map((txn) => {
                const formattedDate = new Date(txn.timestamp).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const formattedAmount = new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: txn.currency || 'INR'
                }).format(txn.amount);

                return (
                  <tr
                    key={txn.id}
                    tabIndex={0}
                    onClick={() => {
                      setSelectedTxn(txn);
                      setShowDetailModal(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedTxn(txn);
                        setShowDetailModal(true);
                      }
                    }}
                  >
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                      {txn.id}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formattedDate}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{txn.merchant}</td>
                    <td>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {txn.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formattedAmount}</td>
                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)' }}>{txn.payment_method}</td>
                    <td>
                      <Badge status={txn.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.5rem 0.25rem'
        }}>
          {/* Results Summary */}
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {pagination.total_items === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
            </strong>{' '}
            to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {Math.min(pagination.page * pagination.limit, pagination.total_items)}
            </strong>{' '}
            of <strong style={{ color: 'var(--text-primary)' }}>{pagination.total_items.toLocaleString()}</strong> transactions
          </div>

          {/* Page Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per page:</span>
              <select
                className="custom-select"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                value={filters.limit}
                onChange={(e) => onFilterChange({ limit: Number(e.target.value), page: 1 })}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.375rem 0.625rem' }}
                disabled={pagination.page <= 1 || loading}
                onClick={() => onFilterChange({ page: pagination.page - 1 })}
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.875rem', padding: '0 0.5rem', color: 'var(--text-secondary)' }}>
                Page <strong style={{ color: 'var(--text-primary)' }}>{pagination.page}</strong> of{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{pagination.total_pages}</strong>
              </span>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.375rem 0.625rem' }}
                disabled={pagination.page >= pagination.total_pages || loading}
                onClick={() => onFilterChange({ page: pagination.page + 1 })}
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hand-built Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTxn}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTxn(null);
        }}
      />
    </div>
  );
};
