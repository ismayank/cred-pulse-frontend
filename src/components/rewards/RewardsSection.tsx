'use client';

import React, { useState } from 'react';
import { RewardItem, UserBalance, RedemptionResult } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { redeemReward } from '@/lib/api';
import { Coins, Gift, CheckCircle2, Sparkles, Tag, ArrowRight, ShieldCheck } from 'lucide-react';

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

    // Check if user has sufficient coins upfront
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
        coins_balance: previousBalance, // Rollback to exact previous balance!
        total_redeemed: balance.total_redeemed
      });

      onShowToast(err.message || 'Redemption failed. Coin balance restored.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Coin Balance Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #111520 0%, #1a2030 100%)',
          borderColor: 'var(--border-accent)',
          padding: '1.75rem 2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid var(--border-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)'
          }}>
            <Coins size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Privé Coin Portfolio Balance
            </span>
            <div className="editorial-num" style={{ color: 'var(--accent-gold)', marginTop: '0.15rem' }}>
              {balance.coins_balance.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Coins</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.75rem', background: 'rgba(8, 10, 15, 0.6)', padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lifetime Earned</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              +{balance.total_earned.toLocaleString()}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.75rem' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Redeemed</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              {balance.total_redeemed.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Catalogue Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--text-primary)' }}>
            Privé Rewards Catalogue
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Earn 1 coin per ₹100 spent on successful card transactions. Redeem instantly against curated rewards.
          </p>
        </div>
      </div>

      {/* Catalogue Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {catalogue.map((reward) => {
          const canAfford = balance.coins_balance >= reward.cost_coins;

          return (
            <div
              key={reward.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0',
                overflow: 'hidden',
                borderColor: canAfford ? 'var(--border-color)' : 'rgba(255, 255, 255, 0.04)',
                opacity: canAfford ? 1 : 0.75
              }}
            >
              {/* Image Banner */}
              <div style={{
                height: 150,
                width: '100%',
                backgroundImage: `url(${reward.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, #0d1017 0%, transparent 85%)'
                }} />
                <span style={{
                  position: 'absolute',
                  top: '0.85rem',
                  left: '0.85rem',
                  background: 'rgba(8, 10, 15, 0.75)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-gold)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {reward.category}
                </span>
              </div>

              {/* Reward Content */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {reward.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    {reward.description}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.95rem' }}>
                    <Coins size={16} />
                    <span>{reward.cost_coins} Coins</span>
                  </div>

                  <button
                    className={`btn ${canAfford ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem' }}
                    onClick={() => {
                      setSelectedReward(reward);
                      setConfirmModalOpen(true);
                    }}
                    disabled={!canAfford}
                  >
                    {canAfford ? 'Redeem Voucher' : 'Insufficient Coins'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal Dialog */}
      {selectedReward && (
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
              >
                {isSubmitting ? 'Redeeming...' : 'Confirm Redemption'}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: 'rgba(8, 10, 15, 0.8)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <Gift size={32} color="var(--accent-gold)" />
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedReward.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cost: {selectedReward.cost_coins} Coins</p>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Your balance will be updated instantly ({balance.coins_balance} → {balance.coins_balance - selectedReward.cost_coins} Coins). Automatic rollback is active if API validation rejects.
            </p>
          </div>
        </Modal>
      )}

      {/* Success Voucher Code Result Modal */}
      {successRedemption && (
        <Modal
          isOpen={!!successRedemption}
          onClose={() => setSuccessRedemption(null)}
          title="Voucher Redeemed Successfully"
          footer={
            <button className="btn btn-primary" onClick={() => setSuccessRedemption(null)}>
              Done
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem', padding: '1rem 0' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'var(--color-success-bg)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success)'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h4 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--text-primary)' }}>
                {successRedemption.reward_title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Use your unique voucher code at checkout:
              </p>
            </div>

            <div style={{
              background: 'rgba(8, 10, 15, 0.9)',
              border: '1px dashed var(--accent-gold)',
              padding: '1rem 2rem',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'monospace',
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              color: 'var(--accent-gold)',
              userSelect: 'all'
            }}>
              {successRedemption.voucher_code}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Remaining Coin Balance: {successRedemption.remaining_balance.toLocaleString()} Coins
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
