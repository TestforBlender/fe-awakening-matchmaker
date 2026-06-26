import { useId, useState } from 'react';
import type { SupportSet } from '@/lib/types';

const RANKS = ['C', 'B', 'A', 'S'] as const;
type Rank = (typeof RANKS)[number];

const RANK_LABEL: Record<Rank, string> = {
  C: 'C — first acquaintance',
  B: 'B — growing closer',
  A: 'A — deep bond',
  S: 'S — marriage',
};

export function SupportSummary({ support }: { support: SupportSet }) {
  // C open by default; ranks toggle independently.
  const [open, setOpen] = useState<Set<Rank>>(new Set<Rank>(['C']));
  const baseId = useId();

  const toggle = (r: Rank) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });

  return (
    <div className="overflow-hidden rounded-panel border border-edge">
      {RANKS.map((r) => {
        const isOpen = open.has(r);
        const panelId = `${baseId}-${r}`;
        return (
          <div key={r} className="border-b border-edge/60 last:border-b-0">
            <h4>
              <button
                type="button"
                onClick={() => toggle(r)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center gap-3 bg-surface-raised px-3 py-2.5 text-left transition hover:bg-surface"
              >
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold font-display text-sm font-bold text-navy-deep"
                  aria-hidden="true"
                >
                  {r}
                </span>
                <span className="flex-1 text-sm font-medium text-ink">
                  {RANK_LABEL[r]}
                </span>
                <span
                  className={`text-ink-soft transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
            </h4>
            <div id={panelId} hidden={!isOpen} className="px-3 pb-3 pt-0">
              <p className="text-sm leading-relaxed text-ink-soft">
                {support.ranks[r]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
