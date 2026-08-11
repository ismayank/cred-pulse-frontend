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
      const result = await redeemReward(rewardToRedeem.id);

      // 3. Confirm with server balance response
      onBalanceUpdated({
        ...balance,
        coins_balance: result.remaining_balance,
        total_redeemed: balance.total_redeemed + rewardToRedeem.cost_coins
      });

      setSuccessRedemption(result);
      setConfirmModalOpen(false);
      onShowToast(`Successfully redeemed ${rewardToRedeem.title}!`, 'success');
    } catch (err: any) {
      // 4. CLEAN ROLLBACK on error
      console.error('Redeem error:', err);
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
        className="glass-voucher-card"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 22, 34, 0.9) 0%, rgba(26, 34, 52, 0.8) 100%)',
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
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.18) 0%, rgba(180, 83, 9, 0.25) 100%)',
            border: '1.5px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)',
            boxShadow: '0 0 24px rgba(212, 175, 55, 0.25)'
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
          background: 'rgba(6, 8, 14, 0.75)',
          padding: '1rem 1.75rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(10px)'
        }}>
          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Lifetime Earned</span>
            <div className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              +{balance.total_earned.toLocaleString()}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Redeemed</span>
            <div className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              {balance.total_redeemed.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Catalogue Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 className="editorial-display" style={{ fontSize: '1.75rem' }}>
            Privé Luxury Vouchers
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Earn 1 coin per ₹100 settled card spend. Instant 1-click redemption with automatic voucher code issue.
          </p>
        </div>
      </div>

      {/* Seamless Voucher Cards Grid (NO Inner Dividers or Seams) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
        gap: '1.75rem'
      }}>
        {catalogue.map((reward) => {
          const canAfford = balance.coins_balance >= reward.cost_coins;

          return (
            <div
              key={reward.id}
              className="glass-voucher-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: canAfford ? 1 : 0.85
              }}
            >
              {/* 100% Opaque Crisp Cover Image Banner */}
              <div style={{
                height: 180,
                width: '100%',
                backgroundImage: `url(${reward.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                {/* Seamless Continuous Blend Overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, transparent 30%, rgba(11, 15, 24, 0.6) 75%, #0b0f18 100%)'
                }} />
                
                {/* Category Badge */}
                <span style={{
                  position: 'absolute',
                  top: '0.9rem',
                  left: '0.9rem',
                  background: 'rgba(6, 8, 14, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-color-light)',
                  color: 'var(--accent-gold)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.28rem 0.8rem',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}>
                  {reward.category}
                </span>

                {/* Discount Value Badge */}
                {reward.discount_value && (
                  <span style={{
                    position: 'absolute',
                    top: '0.9rem',
                    right: '0.9rem',
                    background: 'linear-gradient(135deg, #d4af37 0%, #fef08a 100%)',
                    color: '#080a0f',
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    padding: '0.28rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 4px 14px rgba(212, 175, 55, 0.4)',
                    letterSpacing: '0.02em'
                  }}>
                    {reward.discount_value}
                  </span>
                )}
              </div>

              {/* Seamless Dark Content & Action Body (No Dividers) */}
              <div style={{
                padding: '1.25rem 1.35rem 1.45rem 1.35rem',
                background: 'linear-gradient(180deg, #0b0f18 0%, #06080e 100%)',
                marginTop: '-1px', // Overlap image gradient seamlessly with zero subpixel seam
                display: 'flex',
                flexDirection: 'column',
                gap: '1.15rem',
                flex: 1
              }}>
                <div>
                  <h4 className="font-serif" style={{ fontSize: '1.35rem', color: '#f8fafc', lineHeight: 1.25, fontWeight: 400 }}>
                    {reward.title}
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    {reward.description}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto'
                }}>
                  {/* Coin Cost */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-gold)' }}>
                    <Coins size={19} />
                    <span className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 400 }}>{reward.cost_coins}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Coins</span>
                  </div>

                  {/* High-Contrast Luxury Redeem Voucher Button */}
                  <button
                    onClick={() => {
                      setSelectedReward(reward);
                      setConfirmModalOpen(true);
                    }}
                    disabled={!canAfford}
                    style={{
                      background: canAfford
                        ? 'linear-gradient(135deg, #d4af37 0%, #fef08a 50%, #b45309 100%)'
                        : 'rgba(255, 255, 255, 0.04)',
                      color: canAfford ? '#080a0f' : 'var(--text-muted)',
                      border: canAfford ? 'none' : '1px solid var(--border-color)',
                      padding: '0.6rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 800,
                      fontSize: '0.825rem',
                      letterSpacing: '0.02em',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      boxShadow: canAfford ? '0 4px 20px rgba(212, 175, 55, 0.35)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    <span>{canAfford ? 'Redeem Voucher' : 'Insufficient Coins'}</span>
                    {canAfford && <ArrowRight size={15} color="#080a0f" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Luxury Voucher Confirmation Dialog */}
      {selectedReward && (
        <Modal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="Confirm Privé Voucher Redemption"
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
                  border: 'none',
                  fontWeight: 800
                }}
              >
                {isSubmitting ? 'Processing...' : 'Confirm & Redeem'}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.15rem',
              background: 'rgba(6, 8, 14, 0.9)',
              padding: '1.15rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-accent)'
            }}>
              <Gift size={36} color="var(--accent-gold)" />
              <div>
                <h4 className="font-serif" style={{ fontSize: '1.3rem', color: '#f8fafc' }}>{selectedReward.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>Cost: {selectedReward.cost_coins} Coins</p>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Your portfolio coin balance will update instantly ({balance.coins_balance} → {balance.coins_balance - selectedReward.cost_coins} Coins). Automatic rollback is active if API validation fails.
            </p>
          </div>
        </Modal>
      )}

      {/* Success Voucher Code Modal */}
      {successRedemption && (
        <Modal
          isOpen={!!successRedemption}
          onClose={() => setSuccessRedemption(null)}
          title="Voucher Redeemed Successfully"
          footer={
            <button
              className="btn btn-primary"
              onClick={() => setSuccessRedemption(null)}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #fef08a 100%)',
                color: '#080a0f',
                border: 'none',
                fontWeight: 800
              }}
            >
              Close & View Balance
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.35rem', padding: '1rem 0' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--color-success-bg)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success)',
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.2)'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h4 className="font-serif" style={{ fontSize: '1.65rem', color: '#f8fafc' }}>
                {successRedemption.reward_title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Your unique voucher access code:
              </p>
            </div>

            <div style={{
              background: 'rgba(6, 8, 14, 0.95)',
              border: '1px dashed var(--accent-gold)',
              padding: '1.15rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'monospace',
              fontSize: '1.65rem',
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: 'var(--accent-gold)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              userSelect: 'all'
            }}>
              {successRedemption.voucher_code}
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Remaining Privé Balance: {successRedemption.remaining_balance.toLocaleString()} Coins
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
