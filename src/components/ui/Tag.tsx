import type { ReactNode } from 'react';

export function Tag({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'gold' | 'rose';
}) {
  const styles = {
    default: 'border-edge bg-surface text-ink-soft',
    gold: 'border-gold/50 bg-gold/10 text-goldtext',
    rose: 'border-rose/50 bg-rose/10 text-rosetext',
  }[variant];
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      {children}
    </span>
  );
}
