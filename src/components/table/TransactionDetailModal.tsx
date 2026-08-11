import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Transaction } from '@/types';
import { CreditCard, Calendar, Tag, DollarSign, Award, Building2 } from 'lucide-react';

interface Props {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<Props> = ({
  transaction,
  isOpen,
  onClose
}) => {
  if (!transaction) return null;

  const formattedDate = new Date(transaction.timestamp).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: transaction.currency || 'INR'
  }).format(transaction.amount);

  const coinsEarned = transaction.status === 'SUCCESS'
    ? Math.min(Math.floor(transaction.amount / 100), 500)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transaction Details - ${transaction.id}`}
      footer={
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Summary */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formattedAmount}
            </div>
          </div>
          <Badge status={transaction.status} />
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <Building2 size={16} />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Merchant</span>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{transaction.merchant}</div>
          </div>

          <div className="card" style={{ padding: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <Tag size={16} />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</span>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{transaction.category}</div>
          </div>

          <div className="card" style={{ padding: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <CreditCard size={16} />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Payment Method</span>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{transaction.payment_method}</div>
          </div>

          <div className="card" style={{ padding: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <Award size={16} color="var(--color-amber)" />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Coins Earned</span>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--color-amber)' }}>
              +{coinsEarned} Coins
            </div>
          </div>
        </div>

        {/* Date Time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          background: 'var(--bg-dark)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <Calendar size={16} />
          <span>Timestamp: {formattedDate}</span>
        </div>
      </div>
    </Modal>
  );
};
