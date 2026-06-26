import type { RosterIndex } from '@/lib/types';
import { useMatchStore } from '@/store/useMatchStore';
import { MatchSlot } from './MatchSlot';
import { MatchStatusIndicator } from './MatchStatusIndicator';

export function MatchZone({ roster }: { roster: RosterIndex }) {
  const slots = useMatchStore((s) => s.slots);
  const removeSlot = useMatchStore((s) => s.removeSlot);
  const clear = useMatchStore((s) => s.clear);

  const a = slots[0] ? roster.byId.get(slots[0]!) ?? null : null;
  const b = slots[1] ? roster.byId.get(slots[1]!) ?? null : null;
  const filled = (a ? 1 : 0) + (b ? 1 : 0);

  return (
    <section
      aria-label="Match zone"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/40 bg-surface-raised/95 p-3 shadow-panel backdrop-blur lg:static lg:z-auto lg:rounded-panel lg:border lg:p-4 lg:shadow-panel"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 lg:mb-2 lg:max-w-none">
        <h2 className="font-display text-sm font-semibold text-goldtext">
          Match Zone
        </h2>
        {filled > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-ink-soft underline hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>

      {/* Horizontal on mobile, vertical in the desktop sidebar */}
      <div className="mx-auto flex max-w-6xl items-stretch gap-2 lg:max-w-none lg:flex-col lg:gap-3">
        <MatchSlot index={0} character={a} onRemove={() => removeSlot(0)} />

        <div className="flex w-16 shrink-0 items-center justify-center lg:w-full lg:py-1">
          {/* compact indicator on mobile, full on desktop */}
          <div className="lg:hidden">
            <MatchStatusIndicator a={a} b={b} compact />
          </div>
          <div className="hidden lg:block">
            <MatchStatusIndicator a={a} b={b} />
          </div>
        </div>

        <MatchSlot index={1} character={b} onRemove={() => removeSlot(1)} />
      </div>
    </section>
  );
}
