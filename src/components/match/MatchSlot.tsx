import { useDroppable } from '@dnd-kit/core';
import type { Character } from '@/lib/types';
import { Sprite } from '@/components/ui/Sprite';

interface MatchSlotProps {
  index: 0 | 1;
  character: Character | null;
  onRemove: () => void;
}

export function MatchSlot({ index, character, onRemove }: MatchSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${index}` });

  return (
    <div
      ref={setNodeRef}
      className={`relative flex min-h-[4.5rem] flex-1 items-center gap-2 rounded-panel border-2 px-3 py-2 transition ${
        isOver
          ? 'border-gold bg-gold/10 shadow-gold-glow'
          : character
            ? 'border-edge bg-surface'
            : 'border-dashed border-edge bg-surface/60'
      }`}
    >
      {character ? (
        <>
          <Sprite id={character.id} name={character.name} className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">
              {character.name}
            </p>
            <p className="truncate text-xs text-goldtext">{character.epithet}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full px-1.5 text-ink-soft hover:text-crimson"
            aria-label={`Remove ${character.name} from slot ${index + 1}`}
          >
            ✕
          </button>
        </>
      ) : (
        <div className="flex w-full flex-col items-center justify-center text-center">
          <span className="text-lg text-ink-soft/50" aria-hidden="true">
            ＋
          </span>
          <span className="text-xs text-ink-soft/70">
            Slot {index + 1} — drag or tap a character
          </span>
        </div>
      )}
    </div>
  );
}
