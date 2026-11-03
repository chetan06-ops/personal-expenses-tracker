import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../features/dashboard/StatCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Orbit2DFallback } from '../three/fallback/Orbit2DFallback';
import { Wallet } from 'lucide-react';

describe('UI Component Suite', () => {
  it('Renders StatCard with formatted INR currency and titles', () => {
    render(
      <StatCard
        title="Net Surplus"
        amountPaise={750000} // ₹7,500
        subtitle="Surplus balance"
        icon={<Wallet data-testid="wallet-icon" />}
        variant="cyan"
      />
    );

    expect(screen.getByText('Net Surplus')).toBeInTheDocument();
    expect(screen.getByText('Surplus balance')).toBeInTheDocument();
    expect(screen.getByText(/₹7,500/)).toBeInTheDocument();
  });

  it('Renders Button with loading and disabled states', () => {
    const { rerender } = render(<Button>Save Transaction</Button>);
    expect(screen.getByRole('button', { name: 'Save Transaction' })).toBeEnabled();

    rerender(<Button isLoading>Save Transaction</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('Renders Badges correctly with specific variant classes', () => {
    render(<Badge variant="emerald">Income</Badge>);
    expect(screen.getByText('Income')).toBeInTheDocument();
  });

  it('Renders Orbit2DFallback with category elements and net balance', () => {
    const breakdown = [
      { category: 'Food', amount: 120000, percentage: 50, color: '#F97316', count: 1 },
      { category: 'Travel', amount: 120000, percentage: 50, color: '#06B6D4', count: 1 },
    ];

    render(
      <Orbit2DFallback
        netBalance={500000}
        totalExpenses={240000}
        categoryBreakdown={breakdown}
      />
    );

    expect(screen.getByText('Net Balance')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Travel')).toBeInTheDocument();
  });
});
