'use client';

import React, { useState } from 'react';
import { RewardItem, UserBalance, RedemptionResult } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { redeemReward } from '@/lib/api';
import { Coins, Gift, CheckCircle2, Sparkles, Tag, ArrowRight, ShieldCheck, Crown, Flame, Zap } from 'lucide-react';

interface Props {
  balance: UserBalance | null;
  catalogue: RewardItem[];
  loading: boolean;
  onBalanceUpdated: (newBalance: UserBalance) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const RewardsSection: React.FC<Props> = ({
  balance,
  catalogue,
  loading,
  onBalanceUpdated,
  onShowToast
}) => {
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRedemption, setSuccessRedemption] = useState<RedemptionResult | null>(null);

  if (loading || !balance) {
    return (
      <div className="card" style={{ padding: '2.5rem' }}>
        <div className="skeleton-box" style={{ height: '240px', width: '100%' }} />
      </div>
    );
  }

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !balance) return;

    const rewardToRedeem = selectedReward;
    const previousBalance = balance.coins_balance;

    if (previousBalance < rewardToRedeem.cost_coins) {
      onShowToast(`Insufficient coins! Required: ${rewardToRedeem.cost_coins}, Available: ${previousBalance}`, 'error');
      setConfirmModalOpen(false);
      return;
    }

    setIsSubmitting(true);

    // 1. OPTIMISTIC UPDATE: Deduct coins from state immediately
    const optimisticCoins = previousBalance - rewardToRedeem.cost_coins;
    onBalanceUpdated({
      ...balance,
      coins_balance: optimisticCoins,
      total_redeemed: balance.total_redeemed + rewardToRedeem.cost_coins
    });

    try {
      // 2. Call backend API
      const res = await redeemReward(rewardToRedeem.id);

      // 3. Confirm with actual response balance
      onBalanceUpdated({
        ...balance,
        coins_balance: res.remaining_balance,
        total_redeemed: balance.total_redeemed + rewardToRedeem.cost_coins
      });

      setSuccessRedemption(res);
      setConfirmModalOpen(false);
      onShowToast(`Successfully redeemed ${rewardToRedeem.title}! Code: ${res.voucher_code}`, 'success');
    } catch (err: any) {
      // ROLLBACK on error
      onBalanceUpdated({
        ...balance,
        coins_balance: previousBalance,
        total_redeemed: balance.total_redeemed
      });

      onShowToast(err.message || 'Redemption failed. Coin balance restored.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Glassy Privé Portfolio Balance Banner */}
      <div
        className="card"
        style={{
          borderColor: 'var(--border-accent)',
          padding: '2rem 2.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1.5px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)',
            boxShadow: '0 0 24px var(--accent-gold-glow)'
          }}>
            <Crown size={32} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
              Privé Membership Coin Portfolio
            </span>
            <div className="editorial-display" style={{ color: 'var(--accent-gold)', marginTop: '0.2rem', fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}>
              {balance.coins_balance.toLocaleString()} <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Coins</span>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '2rem',
          background: 'var(--bg-surface-solid)',
          padding: '1rem 1.75rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(10px)'
        }}>
          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Lifetime Earned</span>
            <div className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              {balance.total_earned.toLocaleString()}
            </div>
          </div>
          <div style={{ width: 1, background: 'var(--border-color)' }} />
          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Redeemed</span>
            <div className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--accent-gold)', marginTop: '0.1rem' }}>
              {balance.total_redeemed.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Catalog Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Exclusive Member Privileges
          </span>
          <h2 className="editorial-display" style={{ fontSize: '1.85rem', marginTop: '0.15rem' }}>
            Privé Rewards Catalogue
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
          <Sparkles size={14} /> Instant Code Delivery
        </div>
      </div>

      {/* Catalogue Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {catalogue.map((item) => {
          const canAfford = balance.coins_balance >= item.cost_coins;

          return (
            <div key={item.id} className="glass-voucher-card">
              {/* Cover Image Header */}
              <div style={{
                position: 'relative',
                height: 185,
                width: '100%',
                overflow: 'hidden',
                background: '#090c12'
              }}>
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 1,
                    display: 'block'
                  }}
                />

                {/* Top Floating Badge */}
                <div style={{
                  position: 'absolute',
                  top: '0.85rem',
                  left: '0.85rem',
                  background: 'rgba(9, 12, 18, 0.85)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  backdropFilter: 'blur(8px)'
                }}>
                  {item.category}
                </div>
              </div>

              {/* Seamless Text Body Container */}
              <div style={{
                padding: '1.4rem 1.5rem 1.5rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: 'var(--bg-surface-solid)'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.25
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.4rem',
                    lineHeight: 1.5
                  }}>
                    {item.description}
                  </p>
                </div>

                {/* Value & Coin Cost */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Voucher Benefit</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                      {item.discount_value}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Coin Cost</span>
                    <div style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: 'var(--accent-gold)',
                      marginTop: '0.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      justifyContent: 'flex-end'
                    }}>
                      <Coins size={16} color="var(--accent-gold)" />
                      {item.cost_coins.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Redeem Button */}
                <button
                  className="btn"
                  disabled={!canAfford}
                  onClick={() => {
                    setSelectedReward(item);
                    setConfirmModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: canAfford
                      ? 'linear-gradient(135deg, #d4af37 0%, #fef08a 100%)'
                      : 'var(--bg-surface-hover)',
                    color: canAfford ? '#080a0f' : 'var(--text-muted)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    border: canAfford ? 'none' : '1px solid var(--border-color)',
                    boxShadow: canAfford ? '0 4px 16px rgba(212, 175, 55, 0.3)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>{canAfford ? 'Redeem Voucher' : 'Insufficient Coins'}</span>
                  {canAfford && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Voucher Redemption"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setConfirmModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirmRedeem}
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #fef08a 100%)',
                color: '#080a0f',
                fontWeight: 800,
                border: 'none'
              }}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Redemption'}
            </button>
          </>
        }
      >
        {selectedReward && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Are you sure you want to redeem <strong>{selectedReward.title}</strong> for{' '}
              <strong style={{ color: 'var(--accent-gold)' }}>{selectedReward.cost_coins.toLocaleString()} coins</strong>?
            </p>

            <div style={{
              background: 'var(--bg-surface-hover)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Balance</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {balance.coins_balance.toLocaleString()} Coins
                </div>
              </div>
              <ArrowRight size={20} color="var(--accent-gold)" />
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Balance After Redemption</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  {(balance.coins_balance - selectedReward.cost_coins).toLocaleString()} Coins
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Success Redemption Modal */}
      <Modal
        isOpen={!!successRedemption}
        onClose={() => setSuccessRedemption(null)}
        title="Voucher Redeemed Successfully!"
        footer={
          <button
            className="btn btn-primary"
            onClick={() => setSuccessRedemption(null)}
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #fef08a 100%)',
              color: '#080a0f',
              fontWeight: 800,
              border: 'none',
              width: '100%'
            }}
          >
            Done
          </button>
        }
      >
        {successRedemption && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success)'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {successRedemption.reward_title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Your unique voucher code has been generated. Use this at checkout.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-surface-hover)',
              border: '1.5px dashed var(--accent-gold)',
              padding: '1rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              width: '100%'
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Voucher Code</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'monospace', letterSpacing: '0.15em', marginTop: '0.2rem' }}>
                {successRedemption.voucher_code}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
