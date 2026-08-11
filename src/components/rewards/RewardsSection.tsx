'use client';

import React, { useState } from 'react';
import { RewardItem, UserBalance, RedemptionResult } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { redeemReward } from '@/lib/api';
import { Coins, Gift, CheckCircle2, AlertTriangle, Sparkles, Tag, ArrowRight, ShieldCheck } from 'lucide-react';

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
      <div className="card" style={{ padding: '2rem' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Coin Balance Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderColor: '#6366f1',
          padding: '1.5rem 1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '2px solid var(--color-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-amber)'
          }}>
            <Coins size={32} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Coin Balance
            </span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
              {balance.coins_balance.toLocaleString()} <span style={{ fontSize: '1.125rem', color: 'var(--color-amber)', fontWeight: 600 }}>Coins</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(0,0,0,0.25)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>Lifetime Earned</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>
              +{balance.total_earned.toLocaleString()}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>Total Redeemed</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>
              {balance.total_redeemed.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Catalogue Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Rewards Catalogue
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Earn 1 coin per ₹100 spent on successful bill payments. Redeem instantly for gift cards & passes.
          </p>
        </div>
      </div>

      {/* Catalogue Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.25rem'
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
                borderColor: canAfford ? 'var(--border-color)' : 'rgba(255, 255, 255, 0.05)',
                opacity: canAfford ? 1 : 0.8
              }}
            >
              {/* Image Banner */}
              <div style={{
                height: 140,
                width: '100%',
                backgroundImage: `url(${reward.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, #111827 0%, transparent 80%)'
                }} />
                <span style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '0.75rem',
                  background: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {reward.category}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {reward.title}
                  </h4>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-success)' }}>
                    {reward.discount_value}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, flex: 1 }}>
                  {reward.description}
                </p>
              </div>

              {/* Footer / CTA */}
              <div style={{
                padding: '1rem 1.25rem',
                background: 'rgba(0,0,0,0.2)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-amber)', fontWeight: 700 }}>
                  <Coins size={18} />
                  <span>{reward.cost_coins} Coins</span>
                </div>

                <button
                  className={`btn ${canAfford ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                  disabled={!canAfford}
                  onClick={() => {
                    setSelectedReward(reward);
                    setConfirmModalOpen(true);
                  }}
                >
                  {canAfford ? 'Redeem Voucher' : 'Low Coins'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
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
                {isSubmitting ? 'Redeeming...' : 'Confirm & Deduct Coins'}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: 'var(--bg-card)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <Gift size={32} color="var(--accent-primary)" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedReward.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600 }}>{selectedReward.discount_value}</p>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-dark)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Current Balance:</span>
                <span style={{ fontWeight: 600 }}>{balance.coins_balance} Coins</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Reward Cost:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-failed)' }}>-{selectedReward.cost_coins} Coins</span>
              </div>
              <hr style={{ borderColor: 'var(--border-color)', margin: '0.25rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Remaining Balance:</span>
                <span style={{ color: 'var(--color-amber)' }}>{balance.coins_balance - selectedReward.cost_coins} Coins</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Voucher Code Modal */}
      {successRedemption && (
        <Modal
          isOpen={!!successRedemption}
          onClose={() => setSuccessRedemption(null)}
          title="Redemption Successful! 🎉"
          footer={
            <button className="btn btn-primary" onClick={() => setSuccessRedemption(null)}>
              Done
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center', padding: '0.5rem 0' }}>
            <CheckCircle2 size={56} color="var(--color-success)" />

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{successRedemption.reward_title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Your voucher code has been generated. Use this code at checkout.
              </p>
            </div>

            <div style={{
              background: '#0d131f',
              border: '2px dashed var(--accent-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 2rem',
              width: '100%'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Voucher Code
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--color-amber)', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
                {successRedemption.voucher_code}
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ShieldCheck size={16} color="var(--color-success)" />
              Remaining Balance: {successRedemption.remaining_balance} Coins
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
