import type { Character } from '@/lib/types';
import { checkCompatibility } from '@/lib/compatibility';

interface IndicatorProps {
  a: Character | null;
  b: Character | null;
  /** Compact variant for the mobile bottom bar. */
  compact?: boolean;
}

export function MatchStatusIndicator({ a, b, compact = false }: IndicatorProps) {
  // Fewer than two placed — gentle prompt, no verdict yet.
  if (!a || !b) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-2xl text-ink-soft/40" aria-hidden="true">
          ♥
        </span>
        {!compact && (
          <p className="mt-1 text-xs text-ink-soft">
            {a || b ? 'Add one more to compare' : 'Pick two to compare'}
          </p>
        )}
      </div>
    );
  }

  const result = checkCompatibility(a, b);

  if (result.compatible) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center"
        role="status"
      >
        <span
          className="animate-heart-pop text-3xl text-rose drop-shadow"
          aria-hidden="true"
        >
          ♥
        </span>
        {!compact && (
          <p className="mt-1 text-xs font-medium text-rosetext">
            {result.explanation}
          </p>
        )}
        <span className="sr-only">Match: {result.explanation}</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      role="status"
    >
      <span
        className="animate-x-shake grid h-9 w-9 place-items-center rounded-full bg-crimson/15 text-2xl font-bold text-crimson"
        aria-hidden="true"
      >
        ✕
      </span>
      {!compact && (
        <p className="mt-1 text-xs font-medium text-crimson">No match</p>
      )}
      {!compact && (
        <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">
          {result.explanation}
        </p>
      )}
      <span className="sr-only">No match: {result.explanation}</span>
    </div>
  );
}
