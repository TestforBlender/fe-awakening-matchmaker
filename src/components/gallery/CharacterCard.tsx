import { useDraggable } from '@dnd-kit/core';
import type { Character } from '@/lib/types';
import { Portrait } from '@/components/ui/Portrait';
import { useMatchStore } from '@/store/useMatchStore';

interface CharacterCardProps {
  character: Character;
  onOpenDetail: (character: Character) => void;
  onPlaceFeedback?: (result: string, character: Character) => void;
}

export function CharacterCard({
  character,
  onOpenDetail,
  onPlaceFeedback,
}: CharacterCardProps) {
  const slots = useMatchStore((s) => s.slots);
  const place = useMatchStore((s) => s.place);
  const removeSlot = useMatchStore((s) => s.removeSlot);

  const slotIndex =
    slots[0] === character.id ? 0 : slots[1] === character.id ? 1 : -1;
  const isPaired = slotIndex !== -1;

  // Pointer/touch drag source. We intentionally omit `attributes` (which would
  // make the wrapper a keyboard drag handle) to avoid clashing with the inner
  // buttons; keyboard users place via the + button instead.
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: character.id,
    data: { character },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      className={`group relative cursor-grab touch-manipulation transition-opacity active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      {/* Card body -> detail popover */}
      <button
        type="button"
        onClick={() => onOpenDetail(character)}
        className="block w-full rounded-panel focus-visible:ring-2 focus-visible:ring-gold"
        aria-label={`View details for ${character.name}, ${character.epithet}`}
      >
        <Portrait
          id={character.id}
          name={character.name}
          subtitle={character.epithet}
          decorative
        />
      </button>

      {/* + Pair / paired toggle (the accessible placement path) */}
      <button
        type="button"
        onClick={() => {
          if (isPaired) {
            removeSlot(slotIndex as 0 | 1);
            onPlaceFeedback?.('removed', character);
          } else {
            const result = place(character.id);
            onPlaceFeedback?.(result, character);
          }
        }}
        className={`absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow transition ${
          isPaired
            ? 'border-rose bg-rose text-navy-deep'
            : 'border-gold/60 bg-navy-deep/85 text-gold hover:bg-gold hover:text-navy-deep'
        }`}
        aria-label={
          isPaired
            ? `Remove ${character.name} from match slot ${slotIndex + 1}`
            : `Add ${character.name} to the match zone`
        }
        aria-pressed={isPaired}
      >
        {isPaired ? <>&#9829; {slotIndex + 1}</> : <><span aria-hidden="true">&#65291;</span> Pair</>}
      </button>
    </div>
  );
}
