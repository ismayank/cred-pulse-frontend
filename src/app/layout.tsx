import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CredPulse - Transactions, Rewards & Spend Analytics',
  description: 'Consumer financial dashboard for credit card bill payments, earning reward coins, and tracking spend analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
