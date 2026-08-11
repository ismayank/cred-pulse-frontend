import React from 'react';

interface BadgeProps {
  status: string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase();
  let badgeClass = 'badge-pending';

  if (normalized === 'SUCCESS') {
    badgeClass = 'badge-success';
  } else if (normalized === 'FAILED') {
    badgeClass = 'badge-failed';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot" />
      {normalized}
    </span>
  );
};
