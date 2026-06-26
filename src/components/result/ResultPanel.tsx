import { useEffect, useRef } from 'react';
import type { Character, Pairing, RosterIndex, SupportSet } from '@/lib/types';
import { analyzePairing } from '@/lib/index';
import { Sprite } from '@/components/ui/Sprite';
import { Section } from '@/components/ui/Section';
import { SupportSummary } from './SupportSummary';
import { FamilyTree } from './FamilyTree';

interface ResultPanelProps {
  a: Character | null;
  b: Character | null;
  roster: RosterIndex;
  pairings: Map<string, Pairing>;
  supports: Map<string, SupportSet>;
  onSelectChild: (child: Character) => void;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function ResultPanel({
  a,
  b,
  roster,
  pairings,
  supports,
  onSelectChild,
}: ResultPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pairKey = a && b ? [a.id, b.id].sort().join('__') : '';

  // Gently scroll the panel into view whenever a new valid pair appears.
  useEffect(() => {
    if (!pairKey || !ref.current) return;
    ref.current.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [pairKey]);

  if (!a || !b) return null;

  const analysis = analyzePairing(a.id, b.id, roster, pairings, supports);
  if (!analysis.compatibility.compatible) return null; // invalid → match-zone X only

  const { pairing, support, childIds } = analysis;

  return (
    <div
      ref={ref}
      className="mb-6 scroll-mt-20 overflow-hidden rounded-panel border border-gold/50 bg-surface-raised shadow-panel animate-fade-up"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gold/30 bg-gradient-to-r from-gold/10 to-transparent px-4 py-3">
        <Sprite id={a.id} name={a.name} className="h-11 w-11" decorative />
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold text-ink">
            {a.name}
          </span>
          <span className="text-xl text-rose" aria-hidden="true">
            ♥
          </span>
          <span className="font-display text-lg font-semibold text-ink">
            {b.name}
          </span>
        </div>
        <Sprite id={b.id} name={b.name} className="h-11 w-11" decorative />
      </div>

      <h2 className="sr-only">
        Match result for {a.name} and {b.name}
      </h2>

      <div className="space-y-5 p-4">
        {pairing ? (
          <>
            <Section title="Relationship">
              <p className="text-sm leading-relaxed text-ink-soft">
                {pairing.relationshipSummary}
              </p>
            </Section>
            <Section title="Personality dynamic">
              <p className="text-sm leading-relaxed text-ink-soft">
                {pairing.personalityDynamic}
              </p>
            </Section>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-ink-soft">
            {a.name} and {b.name} can reach an S support and marry. A written
            relationship summary for this pairing hasn’t been added yet.
          </p>
        )}

        {support && (
          <Section title="Support conversations">
            <SupportSummary support={support} />
          </Section>
        )}

        {pairing && (
          <Section title="Gameplay notes">
            <p className="text-sm leading-relaxed text-ink-soft">
              {pairing.gameplayNotes}
            </p>
          </Section>
        )}

        <Section title="Family tree">
          <FamilyTree
            parentA={a}
            parentB={b}
            childIds={childIds}
            roster={roster}
            onSelectChild={onSelectChild}
          />
        </Section>
      </div>
    </div>
  );
}
